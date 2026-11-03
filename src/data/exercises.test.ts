import { describe, expect, it } from 'vitest';
import { generateExercises } from './exercises';

describe('generateExercises', () => {
  const exercises = generateExercises(10000);

  it('sinh đủ 10.000 bài tập với ID không trùng nhau', () => {
    expect(exercises).toHaveLength(10000);
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(10000);
  });

  it('mọi bài có thời lượng từ 30 đến 120 giây', () => {
    expect(exercises.every(({ duration }) => duration >= 30 && duration <= 120)).toBe(true);
  });

  it('sinh dữ liệu xác định và khớp ba bài mẫu của đề', () => {
    const expected = [
      { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 },
      { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 },
      { id: 'e3', name: 'Gập tạ đơn 1', trainer: 'Đức Anh', group: 'Tay', duration: 104 },
    ];
    expect(generateExercises(3)).toEqual(expected);
    expect(generateExercises(3)).toEqual(exercises.slice(0, 3));
  });
});
