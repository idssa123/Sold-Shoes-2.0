import { useState } from "react";

export default function Carousel({ items = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (items.length === 0) return null;

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    return (
        <div className="border border-red-600 bg-black p-4 rounded">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-600">Productos destacados</h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="button-ghost px-2 py-1"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="button-ghost px-2 py-1"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="flex gap-3 overflow-hidden">
                {items.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <div
                            key={item.id}
                            className={`min-w-[200px] border border-red-600 bg-black p-3 rounded ${isActive ? "" : "opacity-50"}`}
                        >
                            <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="absolute inset-0 w-full h-full rounded object-cover"
                                />
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-red-400">{item.brand}</p>
                                <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                                <p className="text-sm text-red-500 font-bold">{item.price}€</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
