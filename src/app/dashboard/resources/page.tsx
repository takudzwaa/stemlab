'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { InventoryService } from '@/services/inventory';
import { Component } from '@/types/inventory';
import { Card, Input, Button } from '@/components/UI';
import { useCart } from '@/context/CartContext';

export default function ResourcesPage() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');

    const [components, setComponents] = useState<Component[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { addToCart } = useCart();

    useEffect(() => {
        const init = async () => {
            let allComponents = await InventoryService.getComponents();
            if (categoryFilter) {
                // Simple mapping for demo purposes, real app might have strict categories
                if (categoryFilter === 'lab') {
                    // Mocking lab resources if they were separate, for now showing all or specific types
                } else if (categoryFilter === 'equipment') {
                    allComponents = allComponents.filter(c => c.category === 'actuator' || c.category === 'sensor');
                } else if (categoryFilter === 'component') {
                    allComponents = allComponents.filter(c => c.category === 'microcontroller');
                }
            }
            setComponents(allComponents);
        };
        init();
    }, [categoryFilter]);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        const results = await InventoryService.searchComponents(e.target.value);
        setComponents(results);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Resources` : 'All Resources'}
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Browse available labs, equipment, and components</p>
            </div>

            <Card>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Input
                        label="Search Resources"
                        placeholder="Type to search..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {components.map(component => (
                        <div key={component.id} style={{
                            border: '1px solid var(--color-border)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            backgroundColor: 'white'
                        }}>
                            <div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#EBF5FF',
                                    color: '#1E429F',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    marginBottom: '0.5rem'
                                }}>
                                    {component.category.toUpperCase()}
                                </div>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{component.name}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{component.description}</p>
                                <div style={{ fontSize: '0.875rem' }}>
                                    <span style={{ fontWeight: 600 }}>Available:</span> {component.availableQuantity} / {component.totalQuantity}
                                </div>
                            </div>
                            <Button
                                style={{ marginTop: '1rem', width: '100%' }}
                                variant="secondary"
                                onClick={() => addToCart(component)}
                                disabled={component.availableQuantity === 0}
                            >
                                {component.availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
