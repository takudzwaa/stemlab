import { Button, Input, Card } from '@/components/UI';
import { useCart } from '@/context/CartContext';

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [components, setComponents] = useState<Component[]>([]);
    const [myOrders, setMyOrders] = useState<ComponentOrder[]>([]);

    // Use global cart context
    const { cart, addToCart, removeFromCart, clearCart } = useCart();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'student') {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        setComponents(InventoryService.getComponents());
        loadOrders(currentUser.id);
    }, []);

    const loadOrders = (userId: string) => {
        const allOrders = InventoryService.getOrders();
        setMyOrders(allOrders.filter(o => o.userId === userId));
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setComponents(InventoryService.searchComponents(e.target.value));
    };

    const submitOrder = () => {
        if (!user || cart.length === 0) return;

        InventoryService.createOrder({
            userId: user.id,
            userName: user.name,
            items: cart.map(item => ({
                componentId: item.component.id,
                componentName: item.component.name,
                quantity: item.quantity
            }))
        });

        clearCart();
        loadOrders(user.id);
        alert('Order submitted successfully!');
    };

    if (!user) return null;

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <div className="flex justify-between items-center mb-4">
                <h1 style={{ color: 'var(--color-primary)' }}>Student Dashboard</h1>
                <Link href="/student/book-lab" className="btn btn-primary">Book Lab Practical</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Column: Inventory Search */}
                <div style={{ gridColumn: 'span 2' }}>
                    <Card title="Component Inventory">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Input
                                label="Search Components"
                                placeholder="Type to search..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {components.map(component => (
                                <div key={component.id} style={{
                                    border: '1px solid var(--color-border)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{component.name}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{component.description}</p>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <span style={{ fontWeight: 600 }}>Available:</span> {component.availableQuantity} / {component.totalQuantity}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => addToCart(component)}
                                        disabled={component.availableQuantity === 0}
                                        style={{ marginTop: '1rem', width: '100%' }}
                                        variant="secondary"
                                    >
                                        {component.availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Cart & Orders */}
                <div className="flex flex-col gap-4">
                    <Card title="Current Cart">
                        {cart.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem' }}>Your cart is empty.</p>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 mb-4">
                                    {cart.map(item => (
                                        <div key={item.component.id} className="flex justify-between items-center" style={{ fontSize: '0.875rem', padding: '0.5rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{item.component.name}</div>
                                                <div style={{ color: 'var(--color-text-secondary)' }}>Qty: {item.quantity}</div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.component.id)} style={{ color: 'var(--color-alert)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={submitOrder} style={{ width: '100%' }}>Submit Order</Button>
                            </>
                        )}
                    </Card>

                    <Card title="My Orders">
                        {myOrders.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)' }}>No past orders.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {myOrders.map(order => (
                                    <div key={order.id} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Order #{order.id}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.125rem 0.375rem',
                                                borderRadius: '999px',
                                                backgroundColor: order.status === 'pending' ? '#FEF3C7' : order.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                                                color: order.status === 'pending' ? '#92400E' : order.status === 'approved' ? '#065F46' : '#991B1B'
                                            }}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                            {order.items.length} items • {new Date(order.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </main>
    );
}
