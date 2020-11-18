import getMaxValue from 'ml-array-max';
import { getKind } from 'ml-peak-shape-generator';

import { selectMethod } from './selectMethod';
import { sumOfGaussianLorentzians } from './shapes/sumOfGaussianLorentzians';
import { sumOfGaussians } from './shapes/sumOfGaussians';
import { sumOfLorentzians } from './shapes/sumOfLorentzians';

const STATE_INIT = 0;
const STATE_MIN = 1;
const STATE_MAX = 2;

const keys = ['x', 'y', 'width', 'mu'];
/**
 * Fits a set of points to the sum of a set of bell functions.
 * @param {object} data - An object containing the x and y data to be fitted.
 * @param {array} peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
 * @param {object} [options = {}]
 * @param {object} [options.shape={}] - it's specify the kind of shape used to fitting.
 * @param {string} [options.shape.kind = 'gaussian'] - kind of shape; lorentzian, gaussian and pseudovoigt are supported.
 * @param {object} [options.optimization = {}] - it's specify the kind and options of the algorithm use to optimize parameters.
 * @param {object} [options.optimization.kind = 'lm'] - kind of algorithm. By default it's levenberg-marquardt.
 * @param {object} [options.optimization.options = {}] - options for the specific kind of algorithm.
 * @returns {object} - A object with fitting error and the list of optimized parameters { parameters: [ {x, y, width} ], error } if the kind of shape is pseudoVoigt mu parameter is optimized.
 */
export function optimize(data, peaks, options = {}) {
  let {
    shape = { kind: 'gaussian' },
    optimization = {
      kind: 'lm',
    },
  } = options;

  peaks = JSON.parse(JSON.stringify(peaks));

  let kind = getKind(shape.kind);

  let x = data.x;
  let maxY = getMaxValue(data.y);
  let y = data.y.map((e) => (e /= maxY));

  let nbParams;
  let paramsFunc;
  switch (kind) {
    case 1:
      nbParams = 3;
      paramsFunc = sumOfGaussians;
      break;
    case 2:
      nbParams = 3;
      paramsFunc = sumOfLorentzians;
      break;
    case 3:
      nbParams = 4;
      paramsFunc = sumOfGaussianLorentzians;
      break;
    default:
      throw new Error('kind of shape is not supported');
  }

  let pInit = new Float64Array(peaks.length * nbParams);
  let pMin = new Float64Array(peaks.length * nbParams);
  let pMax = new Float64Array(peaks.length * nbParams);
  let deltaX = Math.abs(data.x[0] - data.x[1]);

  for (let i = 0; i < peaks.length; i++) {
    let peak = peaks[i];
    for (let s = 0; s < nbParams; s++) {
      pInit[i + s * peaks.length] = getValue(s, peak, STATE_INIT, deltaX);
      pMin[i + s * peaks.length] = getValue(s, peak, STATE_MIN, deltaX);
      pMax[i + s * peaks.length] = getValue(s, peak, STATE_MAX, deltaX);
    }
  }

  let { algorithm, optimizationOptions } = selectMethod(optimization);

  optimizationOptions.minValues = pMin;
  optimizationOptions.maxValues = pMax;
  optimizationOptions.initialValues = pInit;

  let pFit = algorithm({ x, y }, paramsFunc, optimizationOptions);

  let { parameterError: error, iterations } = pFit;
  let result = { error, iterations, peaks };
  for (let i = 0; i < peaks.length; i++) {
    pFit.parameterValues[i + peaks.length] *= maxY;
    for (let s = 0; s < nbParams; s++) {
      // we modify the optimized parameters
      peaks[i][keys[s]] = pFit.parameterValues[i + s * peaks.length];
    }
  }
  return result;
}

function getValue(parameterIndex, peak, key, dt) {
  let value;
  switch (parameterIndex) {
    case 0:
      value =
        key === STATE_INIT
          ? peak.x
          : key === STATE_MIN
          ? peak.x - dt
          : peak.x + dt;
      break;
    case 1:
      value = key === STATE_INIT ? peak.y : key === STATE_MIN ? 0 : 1.5;
      break;
    case 2:
      value =
        key === STATE_INIT
          ? peak.width
          : key === STATE_MIN
          ? peak.width / 4
          : peak.width * 4;
      break;
    default:
      value = key === STATE_INIT ? 0.5 : key === STATE_MIN ? 0 : 1;
  }
  return value;
}
