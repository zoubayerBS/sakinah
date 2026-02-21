import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle.jsx';

describe('ThemeToggle Component', () => {
    it('renders the theme toggle button', () => {
        render(<ThemeToggle theme="light" onToggle={() => { }} />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
    });

    it('calls onToggle when the button is clicked', () => {
        const handleToggle = vi.fn();
        render(<ThemeToggle theme="light" onToggle={handleToggle} />);

        const button = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(button);

        expect(handleToggle).toHaveBeenCalledTimes(1);
    });
});
