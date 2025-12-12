import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import API from '../services/api';
import { ZoomIn, ZoomOut, Download, Maximize2, Users, GitBranch } from 'lucide-react';

const FamilyTree = ({ familyId }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    fetchTreeData();
  }, [familyId]);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/family/families/${familyId}/tree-with-relations`);
      setTreeData(res.members);
    } catch (err) {
      console.error('Failed to fetch tree data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (treeData && treeData.length > 0 && svgRef.current) {
      drawTree();
    }
  }, [treeData]);

  const drawTree = () => {
    const width = containerRef.current.clientWidth;
    const height = Math.max(600, treeData.length * 60);
    
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const treeLayout = d3.tree().size([height - 100, width - 200]);
    
    const rootNode = {
      id: "root",
      name: "Family Tree",
      children: buildTreeHierarchy(treeData)
    };
    
    const root = d3.hierarchy(rootNode);
    const treeDataLayout = treeLayout(root);

    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const g = svg.append("g")
      .attr("transform", `translate(100, 50)`);

    // Draw links
    g.selectAll(".link")
      .data(treeDataLayout.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", 2);

    // Draw nodes
    const nodes = g.selectAll(".node")
      .data(treeDataLayout.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        if (d.data.personData) {
          setSelectedNode(d.data.personData);
        }
      });

    // Node circles with gender colors
    nodes.append("circle")
      .attr("r", 20)
      .style("fill", d => {
        if (!d.data.personData) return '#6b7280';
        if (d.data.personData.gender === 'male') return '#3b82f6';
        if (d.data.personData.gender === 'female') return '#ec4899';
        return '#6b7280';
      })
      .style("stroke", "#fff")
      .style("stroke-width", 3)
      .style("cursor", "pointer");

    // Node labels
    nodes.append("text")
      .attr("dy", ".35em")
      .attr("y", d => d.children ? -30 : 30)
      .style("text-anchor", "middle")
      .style("font-weight", "600")
      .style("font-size", "12px")
      .style("fill", "#1f2937")
      .text(d => d.data.name);

    // Age labels
    nodes.append("text")
      .attr("dy", ".35em")
      .attr("y", d => d.children ? -20 : 40)
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#6b7280")
      .text(d => {
        if (d.data.personData?.age) {
          return `${d.data.personData.age}y`;
        }
        return '';
      });

    // Relationship labels
    nodes.append("text")
      .attr("dy", ".35em")
      .attr("y", d => d.children ? -40 : 50)
      .style("text-anchor", "middle")
      .style("font-size", "9px")
      .style("fill", "#8b5cf6")
      .text(d => {
        if (d.data.personData?.relationLabel) {
          return d.data.personData.relationLabel;
        }
        return '';
      });
  };

  const buildTreeHierarchy = (members) => {
    const findRoots = members.filter(member => 
      !member.relationships?.parents || member.relationships.parents.length === 0
    );

    const buildNode = (person) => {
      const node = {
        name: person.name,
        personData: person,
        children: []
      };

      const children = members.filter(member => 
        member.relationships?.parents?.some(pId => pId.toString() === person._id.toString())
      );

      for (const child of children) {
        const childNode = buildNode(child);
        node.children.push(childNode);
      }

      return node;
    };

    const hierarchy = [];
    for (const root of findRoots) {
      const rootNode = buildNode(root);
      hierarchy.push(rootNode);
    }

    return hierarchy;
  };

  const zoomIn = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().scaleBy, 1.2
    );
  };

  const zoomOut = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().scaleBy, 0.8
    );
  };

  const resetZoom = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().transform, d3.zoomIdentity
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={zoomIn}
          className="bg-white p-2 rounded-lg shadow hover:shadow-md transition"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={zoomOut}
          className="bg-white p-2 rounded-lg shadow hover:shadow-md transition"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={resetZoom}
          className="bg-white p-2 rounded-lg shadow hover:shadow-md transition"
          title="Reset Zoom"
        >
          <Maximize2 size={20} />
        </button>
        <button
          onClick={() => {/* Export functionality */}}
          className="bg-white p-2 rounded-lg shadow hover:shadow-md transition"
          title="Export Tree"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Tree Container */}
      <div ref={containerRef} className="border rounded-lg bg-white overflow-auto p-4">
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="mt-6 bg-white rounded-lg shadow p-6 animate-fadeIn">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2" />
            Member Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Personal Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {selectedNode.name}</p>
                {selectedNode.dob && (
                  <p><span className="font-medium">Date of Birth:</span> {new Date(selectedNode.dob).toLocaleDateString()}</p>
                )}
                {selectedNode.gender && (
                  <p><span className="font-medium">Gender:</span> {selectedNode.gender}</p>
                )}
                {selectedNode.occupation && (
                  <p><span className="font-medium">Occupation:</span> {selectedNode.occupation}</p>
                )}
                {selectedNode.age && (
                  <p><span className="font-medium">Age:</span> {selectedNode.age} years</p>
                )}
              </div>
            </div>
            
            {selectedNode.business && (
              <div>
                <h4 className="font-semibold mb-3">Business Information</h4>
                <div className="space-y-2">
                  {selectedNode.business.name && (
                    <p><span className="font-medium">Business:</span> {selectedNode.business.name}</p>
                  )}
                  {selectedNode.business.industry && (
                    <p><span className="font-medium">Industry:</span> {selectedNode.business.industry}</p>
                  )}
                  {selectedNode.business.contact && (
                    <p><span className="font-medium">Contact:</span> {selectedNode.business.contact}</p>
                  )}
                </div>
              </div>
            )}

            {selectedNode.calculatedRelationships && (
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center">
                  <GitBranch className="mr-2" />
                  Relationships
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedNode.calculatedRelationships.parents?.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium text-blue-700">Parents</p>
                      <p className="text-sm">{selectedNode.calculatedRelationships.parents.length}</p>
                    </div>
                  )}
                  {selectedNode.calculatedRelationships.children?.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium text-green-700">Children</p>
                      <p className="text-sm">{selectedNode.calculatedRelationships.children.length}</p>
                    </div>
                  )}
                  {selectedNode.calculatedRelationships.siblings?.length > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="font-medium text-purple-700">Siblings</p>
                      <p className="text-sm">{selectedNode.calculatedRelationships.siblings.length}</p>
                    </div>
                  )}
                  {selectedNode.calculatedRelationships.spouses?.length > 0 && (
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <p className="font-medium text-pink-700">Spouses</p>
                      <p className="text-sm">{selectedNode.calculatedRelationships.spouses.length}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setSelectedNode(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span>Male</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-pink-500 mr-2"></div>
          <span>Female</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
          <span>Other/Unknown</span>
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;