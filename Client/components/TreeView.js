import React, { useEffect, useState } from 'react';
import Tree from 'react-d3-tree';
import API from '../services/api';

export default function TreeView({ familyId }) {
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      const res = await API.get(`/family/${familyId}/members`);
      const members = res.data;
      const buildTree = (members) => {
        // Simplified tree builder
        const root = members.find(m => m.relationships.parent.length === 0);
        const build = (person) => ({
          name: person.name,
          children: members.filter(m => m.relationships.parent.includes(person._id)).map(build)
        });
        return build(root);
      };
      setTreeData(buildTree(members));
    };
    fetchTree();
  }, [familyId]);

  return treeData ? <Tree data={treeData} orientation="vertical" /> : <p>Loading tree...</p>;
}