import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { bodyById } from './content/bodies';

let useStore: typeof import('./state').useStore;
beforeAll(async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} });
  useStore = (await import('./state')).useStore;
});
afterAll(() => vi.unstubAllGlobals());

describe('Continuous solar system navigation', () => {
  it.each(Object.keys(bodyById))('visits %s without isolating it, including from a previous isolated view', id => {
    useStore.setState({ view: 'local', section: 'passport' });
    const reset = useStore.getState().resetCamera;
    useStore.getState().select(id);
    const state = useStore.getState();
    expect(state.view).toBe('system');
    expect(state.selected).toBe(id);
    expect(state.section).toBe('explore');
    expect(state.resetCamera).toBe(reset + 1);
    expect(state.progress.visited).toContain(id);
  });
  it('requires an explicit inspection action to open the separate educational scale', () => {
    useStore.getState().inspect('earth');
    expect(useStore.getState().view).toBe('local');
    useStore.getState().inspect('moon');
    expect(useStore.getState().view).toBe('moon');
    useStore.getState().select('earth');
    expect(useStore.getState().view).toBe('system');
  });
  it('refocuses a repeated selection and restores the overview', () => {
    useStore.getState().select('earth');
    const reset = useStore.getState().resetCamera;
    useStore.getState().select('earth');
    expect(useStore.getState().resetCamera).toBe(reset + 1);
    useStore.getState().overview();
    expect(useStore.getState().selected).toBe('sun');
    expect(useStore.getState().view).toBe('system');
  });
});
