jest.mock('react-dom/client', () => {
  const render = jest.fn();
  const createRoot = jest.fn(() => ({ render }));
  return {
    __esModule: true,
    default: { createRoot },
    createRoot,
  };
});

test('index bootstraps React app into #root', async () => {
  const rootEl = document.createElement('div');
  rootEl.id = 'root';
  document.body.appendChild(rootEl);

  await import('./index');

  const mod = (await import('react-dom/client')) as unknown as {
    default: { createRoot: jest.Mock };
    createRoot: jest.Mock;
  };
  const createRoot = mod.default.createRoot;
  expect(createRoot).toHaveBeenCalledWith(rootEl);
  const render = (createRoot.mock.results[0].value as { render: jest.Mock }).render;
  expect(render).toHaveBeenCalled();
});


export {};
