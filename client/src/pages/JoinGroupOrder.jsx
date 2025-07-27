import { useState, useEffect } from 'react';
import api from '../utils/api';

const JoinGroupOrder = () => {
  const [groupOrders, setGroupOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/group-orders').then(res => setGroupOrders(res.data.orders));
  }, []);

  const handleJoin = async () => {
    await api.post(`/group-orders/${selectedOrder}/join`, { items });
    alert('Joined group order');
  };

  return (
    <div>
      <select onChange={e => setSelectedOrder(e.target.value)}>
        {groupOrders.map(go => <option key={go._id} value={go._id}>{go.name}</option>)}
      </select>
      {/* Add inputs to select product/qty for real app */}
      <button onClick={handleJoin}>Join</button>
    </div>
  );
};

export default JoinGroupOrder;
