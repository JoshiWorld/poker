'use client';

import React, { useState } from 'react';

type PlayerInput = {
    name: string;
    deposited: number;
    current: number;
};

type Transaction = {
    from: string;
    to: string;
    amount: number;
};

export default function SettlementCalculator() {
    const [players, setPlayers] = useState<PlayerInput[]>([
        { name: '', deposited: 0, current: 0 },
    ]);

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const handleChange = (index: number, field: keyof PlayerInput, value: string | number) => {
        const updatedPlayers = [...players];
        // @ts-expect-error || @ts-ignore
        updatedPlayers[index][field] = field === 'name' ? String(value) : parseFloat(value as string) || 0;
        setPlayers(updatedPlayers);
    };

    const addPlayer = () => {
        setPlayers([...players, { name: '', deposited: 0, current: 0 }]);
    };

    const calculateSettlement = () => {
        const balances = players.map(p => ({
            name: p.name || `Spieler ${players.indexOf(p) + 1}`,
            balance: parseFloat((p.current - p.deposited).toFixed(2)),
        }));

        const debtors = balances.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
        const creditors = balances.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);

        const result: Transaction[] = [];

        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            // @ts-expect-error || @ts-ignore
            const amount = Math.min(-debtor.balance, creditor.balance);

            if (amount > 0) {
                result.push({
                    // @ts-expect-error || @ts-ignore
                    from: debtor.name,
                    // @ts-expect-error || @ts-ignore
                    to: creditor.name,
                    amount: parseFloat(amount.toFixed(2)),
                });

                // @ts-expect-error || @ts-ignore
                debtor.balance += amount;
                // @ts-expect-error || @ts-ignore
                creditor.balance -= amount;
            }

            // @ts-expect-error || @ts-ignore
            if (Math.abs(debtor.balance) < 0.01) i++;
            // @ts-expect-error || @ts-ignore
            if (Math.abs(creditor.balance) < 0.01) j++;
        }

        setTransactions(result);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold">💸 Schuldenausgleichsrechner</h1>

            {players.map((player, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b pb-2">
                    <div>
                        <label className="font-semibold">Spieler {index + 1}:</label>
                        <input
                            type="text"
                            placeholder="Name"
                            className="p-2 border rounded w-full"
                            value={player.name}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Eingezahlt:</label>
                        <input
                            type="number"
                            placeholder="Eingezahlt (€)"
                            className="p-2 border rounded w-full"
                            value={player.deposited}
                            onChange={(e) => handleChange(index, 'deposited', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Aktuelles Geld:</label>
                        <input
                            type="number"
                            placeholder="Aktuelles Geld (€)"
                            className="p-2 border rounded w-full"
                            value={player.current}
                            onChange={(e) => handleChange(index, 'current', e.target.value)}
                        />
                    </div>
                </div>
            ))}

            <div className="flex gap-4">
                <button
                    onClick={addPlayer}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    ➕ Spieler hinzufügen
                </button>
                <button
                    onClick={calculateSettlement}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    ✅ Berechne Ausgleich
                </button>
            </div>

            <div className="flex gap-4">
                <p className='px-4 py-2'>Eingezahltes Geld: {players.reduce((sum, player) => sum + player.deposited, 0)} €</p>
                <p className='px-4 py-2'>Saldo: {players.reduce((sum, p) => sum + (p.current - p.deposited), 0)} €</p>
            </div>

            {transactions.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">🔁 Überweisungen:</h2>
                    <ul className="space-y-2">
                        {transactions.map((t, idx) => (
                            <li key={idx} className="p-2 bg-gray-100 rounded">
                                <strong>{t.from}</strong> ➡️ <strong>{t.to}</strong> — {t.amount.toFixed(2)} €
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
