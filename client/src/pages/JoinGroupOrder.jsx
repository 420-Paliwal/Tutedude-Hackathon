import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const JoinGroupOrder = () => {
  const [groupOrders, setGroupOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [items, setItems] = useState([]);
  const { success, error } = useToast();

  useEffect(() => {
    api.get('/group-orders')
      .then((res) => setGroupOrders(res.data.orders))
      .catch(() => error('❌ Failed to fetch group orders'));
  }, []);

  const handleJoin = async () => {
    try {
      await api.post(`/group-orders/${selectedOrder}/join`, { items });
      success('✅ Successfully joined the group order');
    } catch (err) {
      console.error(err);
      error('❌ Failed to join group order');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🤝 Join a Group Order</h2>
      <select
        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onChange={(e) => setSelectedOrder(e.target.value)}
        value={selectedOrder}
      >
        <option value="">Select a Group Order</option>
        {groupOrders.map((go) => (
          <option key={go._id} value={go._id}>{go.name}</option>
        ))}
      </select>
      <button
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
        onClick={handleJoin}
      >
        Join Group Order
      </button>
    </div>
  );
};

export default JoinGroupOrder;
