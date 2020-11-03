import { pseudovoigtFct } from 'ml-peak-shape-generator';

/**
 * This function calculates the spectrum as a sum of linear combination of gaussian and lorentzian functions. The pseudo voigt
 * parameters are divided in 4 batches. 1st: centers; 2nd: heights; 3th: widths; 4th: mu's ;
 * @param t Ordinate value
 * @param p Lorentzian parameters
 * @returns {*}
 */

// export function sumOfGaussianLorentzians(p) {
//   const factor = 2 * Math.sqrt(2 * Math.log(2));
//   return function (t) {
//     let nL = p.length / 4;
//     let result = 0;
//     for (let i = 0; i < nL; i++) {
//       let xG = p[i + nL * 3];
//       let xL = 1 - xG;
//       let p2 = Math.pow(p[i + nL * 2] / 2, 2);
//       let factorL = xL * p[i + nL] * p2;
//       let factorG = xG * p[i + nL];
//       result +=
//         factorG *
//           Math.exp(-Math.pow(((t - p[i]) / p[i + nL * 2]) * factor, 2) / 2) +
//         factorL / (Math.pow(t - p[i], 2) + p2);
//     }
//     return result;
//   };
// }

export function sumOfGaussianLorentzians(p) {
  return function (t) {
    let nL = p.length / 4;
    let result = 0;
    for (let i = 0; i < nL; i++) {
      let func = pseudovoigtFct({
        x: p[i],
        y: p[i + nL],
        width: p[i + nL * 2],
        mu: p[i + nL * 3],
      });
      result += func(t);
    }
    return result;
  };
}
