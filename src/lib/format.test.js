import { describe, it, expect } from 'vitest';
import { formatRupiah, formatTanggal } from './format';

describe('formatRupiah', () => {
  it('memformat angka menjadi mata uang Rupiah', () => {
    expect(formatRupiah(15000)).toBe('Rp15.000');
  });
  it('memformat angka nol', () => {
    expect(formatRupiah(0)).toBe('Rp0');
  });
});

describe('formatTanggal', () => {
  it('mengubah waktu UTC menjadi WIB', () => {
    expect(formatTanggal('2026-10-12T07:05:00Z')).toBe('12/10/2026 14.05');
  });
  it('menyesuaikan tanggal ketika waktu UTC melewati tengah malam WIB', () => {
    expect(formatTanggal('2026-10-12T20:30:00Z')).toBe('13/10/2026 03.30');
  });
});
