import { useState } from 'react';
import api from '../utils/api';

const CreateGroupOrder = () => {
  const [name, setName] = useState('');

  const handleCreate = async () => {
    try {
      const res = await api.post('/group-orders', { name });
      alert('Group order created');
    } catch (err) {
      console.error(err);
      alert('Failed to create group order');
    }
  };

  return (
    <div>
      <input placeholder="Group Order Name" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={handleCreate}>Create Group Order</button>
    </div>
  );
};

export default CreateGroupOrder;
