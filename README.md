[![NPM version][npm-image]][npm-url] [![build status][travis-image]][travis-url] [![npm download][download-image]][download-url]

# ml-spectra-fitting

Curve fitting method in javascript.

This is spectra fitting package optimize the position (x), max intensity (y), full width at half maximum (width) and the percent of gaussian (mu). It supports three kind of shapes:

| Name         |                                                                                                                            Equation                                                                                                                             |
| ------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Gaussian     |                                                                 <img src="https://tex.cheminfo.org/?tex=y%20%5Ccdot%20exp%20%5Cleft%5B%5Cfrac%7B%5Cdelta%7D%7B2%20%5Csigma%5E2%7D%5Cright%5D"/>                                                                 |
| Lorentzian   |                                                                             <img src="https://tex.cheminfo.org/?tex=y%5Ccdot%5Cfrac%7B%5Cgamma%7D%7B%5Cdelta%20%2B%20%5Cgamma%7D"/>                                                                             |
| Pseudo Voigt | <img src="https://tex.cheminfo.org/?tex=y%20*%20%5Cleft%5B%5Cmu%20%5Ccdot%20exp%20%5Cleft%5B%5Cfrac%7B%5Cdelta%7D%7B2%20%5Csigma%5E2%7D%5Cright%5D%20%2B%20(1%20-%20%5Cmu)%20%5Ccdot%20%5Cfrac%7B%5Cgamma%7D%7B%5Cdelta%20%2B%20%5Cgamma%7D%20%5Cright%5D%0A"/> |

where

| <img src="https://tex.cheminfo.org/?tex=%5Cdelta%20%3D%20%5Cleft(t%20-%20x%5Cright)%5E2%0A"/> | <img src="https://tex.cheminfo.org/?tex=%5Csigma%20%3D%20%5Cfrac%7Bwidth%7D%7B2%5Csqrt%7B2%20%5Ccdot%20Log(2)%7D%7D"/> | <img src="https://tex.cheminfo.org/?tex=%5Cgamma%3D%5Cleft(width%5Cright)%5E2"/> |
| --------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------- |


It is a wrapper of [ml-levenberg-marquardt](https://github.com/mljs/levenberg-marquardt)

## [API Documentation](https://mljs.github.io/spectra-fitting/)

## Installation

`$ npm install ml-spectra-fitting`

## Example

```js
// import library
import { optimizeSum } from 'ml-spectra-fitting';
import { SpectrumGenerator } from 'spectrum-generator';

const generator = new SpectrumGenerator({
  nbPoints: 41,
  from: -1,
  to: 1,
});

generator.addPeak({ x: 0.5, y: 0.2 }, { width: 0.2 });
generator.addPeak({ x: -0.5, y: 0.2 }, { width: 0.3 });

//points to fit {x, y};
let data = generator.getSpectrum();

//the approximate values to be optimized, It could comming from a peak picking with ml-gsd
let peakList = [
  {
    x: -0.5,
    y: 0.18,
    width: 0.18,
  },
  {
    x: 0.52,
    y: 0.17,
    width: 0.37,
  },
];

// the function recive a peaklist with {x, y, width} as a guess
// and return a list of objects

let fittedParams = optimizeSum(data, peakList);
console.log(fittedParams);
/**
 {
    error: 0.010502794375558983,
    iterations: 15,
    parameters: [
      {
        x: -0.49999760133593774,
        y: 0.1999880261075537,
        width: 0.3000369491704072
      },
      {
        x: 0.5000084944744884,
        y: 0.20004144804853427,
        width: 0.1999731186595336
      }
    ]
  }
 */
```

For data with and combination of signals with shapes between gaussian and lorentzians, we could use the kind pseudovoigt to fit the data.

```js
import { optimizeSum } from 'ml-spectra-fitting';
import { SpectrumGenerator } from 'spectrum-generator';

const generator = new SpectrumGenerator({
  nbPoints: 101,
  from: -1,
  to: 1,
});

// by default the kind of shape is gaussian;
generator.addPeak({ x: 0.5, y: 0.2 }, { width: 0.2 });
generator.addPeak(
  { x: -0.5, y: 0.2 },
  {
    width: 0.1,
    shape: {
      kind: 'lorentzian',
      options: {
        fwhm: 1000,
        length: 50001,
        factor: 5
      },
    },
  },
);

//points to fit {x, y};
let data = generator.getSpectrum();
console.log(JSON.stringify({x: Array.from(data.x), y: Array.from(data.y)}))
//the approximate values to be optimized, It could comming from a peak picking with ml-gsd
let peakList = [
  {
    x: -0.5,
    y: 0.22,
    width: 0.25,
  },
  {
    x: 0.52,
    y: 0.18,
    width: 0.18,
  },
];

// the function recive a peaklist with {x, y, width} as a guess
// and return a list of objects
let fittedParams = optimizeSum(data, peakList, { kind: 'pseudovoigt' });

console.log(fittedParams);
/**
{
  error: 0.12361588652854476,
  iterations: 100,
  parameters: [
    {
      x: -0.5000014532421942,
      y: 0.19995307937326137,
      width: 0.10007670374735196,
      mu: 0.004731136777288483
    },
    {
      x: 0.5001051783652894,
      y: 0.19960010175400406,
      width: 0.19935932346969124,
      mu: 1
    }
  ]
}
*/
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-spectra-fitting.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ml-spectra-fitting
[travis-image]: https://img.shields.io/travis/mljs/spectra-fitting/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/spectra-fitting
[download-image]: https://img.shields.io/npm/dm/ml-spectra-fitting.svg?style=flat-square
[download-url]: https://npmjs.org/package/ml-spectra-fitting
