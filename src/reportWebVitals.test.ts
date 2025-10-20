import * as webVitals from 'web-vitals';
import reportWebVitals from './reportWebVitals';

test('reportWebVitals does nothing when no handler provided', () => {
  expect(() => reportWebVitals()).not.toThrow();
});

test('reportWebVitals wires web-vitals getters to handler', () => {
  const handler = jest.fn();
  jest.spyOn(webVitals, 'getCLS').mockImplementation((cb: any) => cb && cb('cls'));
  jest.spyOn(webVitals, 'getFID').mockImplementation((cb: any) => cb && cb('fid'));
  jest.spyOn(webVitals, 'getFCP').mockImplementation((cb: any) => cb && cb('fcp'));
  jest.spyOn(webVitals, 'getLCP').mockImplementation((cb: any) => cb && cb('lcp'));
  jest.spyOn(webVitals, 'getTTFB').mockImplementation((cb: any) => cb && cb('ttfb'));

  reportWebVitals(handler);

  expect(handler).toHaveBeenCalledTimes(5);
});
