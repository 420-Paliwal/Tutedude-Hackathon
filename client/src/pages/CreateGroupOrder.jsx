import { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const CreateGroupOrder = () => {
  const [name, setName] = useState('');
  const { success, error } = useToast();

  const handleCreate = async () => {
    try {
      await api.post('/group-orders', { name });
      success('✅ Group order created successfully');
      setName('');
    } catch (err) {
      console.error(err);
      error('❌ Failed to create group order');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">➕ Create a New Group Order</h2>
      <input
        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="Enter Group Order Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
        onClick={handleCreate}
      >
        Create Group Order
      </button>
    </div>
  );
};

export default CreateGroupOrder;
