'use client';

import { useState } from 'react';
import { InventoryService } from '@/services/inventory';
import { Component } from '@/types/inventory';

const MOCK_COMPONENTS: Omit<Component, 'id'>[] = [
    {
        name: 'Arduino Uno R3',
        category: 'microcontroller',
        totalQuantity: 20,
        availableQuantity: 20,
        description: 'Microcontroller board based on the ATmega328P'
    },
    {
        name: 'Raspberry Pi 4 Model B',
        category: 'microcontroller',
        totalQuantity: 10,
        availableQuantity: 10,
        description: 'High-performance single-board computer'
    },
    {
        name: 'Ultrasonic Sensor HC-SR04',
        category: 'sensor',
        totalQuantity: 50,
        availableQuantity: 50,
        description: 'Ultrasonic ranging module'
    },
    {
        name: 'Servo Motor SG90',
        category: 'actuator',
        totalQuantity: 30,
        availableQuantity: 30,
        description: 'Tiny and lightweight with high output power'
    },
    {
        name: 'DHT11 Temperature & Humidity Sensor',
        category: 'sensor',
        totalQuantity: 40,
        availableQuantity: 40,
        description: 'Basic, low-cost digital temperature and humidity sensor'
    },
    {
        name: 'Breadboard',
        category: 'other',
        totalQuantity: 100,
        availableQuantity: 100,
        description: 'Solderless breadboard for prototyping'
    },
    {
        name: 'Jumper Wires (Male-to-Male)',
        category: 'other',
        totalQuantity: 500,
        availableQuantity: 500,
        description: 'Bundle of 65 jumper wires'
    },
    {
        name: 'LED Kit (Assorted Colors)',
        category: 'other',
        totalQuantity: 50,
        availableQuantity: 50,
        description: 'Box of 500 LEDs in various colors'
    },
    {
        name: 'Resistor Kit',
        category: 'other',
        totalQuantity: 50,
        availableQuantity: 50,
        description: 'Assorted resistors 1/4W'
    },
    {
        name: 'DC Motor',
        category: 'actuator',
        totalQuantity: 40,
        availableQuantity: 40,
        description: '3V-6V DC Motor for robotics'
    }
];

export default function SeedPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Starting seed process...');
        try {
            let count = 0;
            for (const component of MOCK_COMPONENTS) {
                await InventoryService.addComponent(component);
                count++;
                setStatus(`Added ${count} / ${MOCK_COMPONENTS.length} components...`);
            }
            setStatus(`Successfully added ${count} components to the database!`);
        } catch (error) {
            console.error(error);
            setStatus('Error seeding database. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Database Seeder</h1>
            <p style={{ marginBottom: '1.5rem' }}>
                Click the button below to populate the Firestore database with initial component data.
            </p>

            <button
                onClick={handleSeed}
                disabled={loading}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: loading ? '#9CA3AF' : '#2563EB',
                    color: 'white',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Seeding...' : 'Seed Database'}
            </button>

            {status && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB'
                }}>
                    {status}
                </div>
            )}
        </div>
    );
}
