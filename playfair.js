//movie uses J substitution and left/up row/column decipher directions

//let KNOWN_KEY_LENGTH  = 5;
let MATRIX_SIZE       = 5;
let UPPERCASE_LETTERS = String.fromCharCode(...Array(91).keys()).slice(65).split('');
let ALL_WORDS         = require('./words.json');
ALL_WORDS         = ['DEATH'];

let OMITTED_LETTER           = 'J';
let SUBSTITUTE_LETTER        = 'I';
let DOUBLE_LETTER_SUBSTITUTE = 'X';

function reduceKey(rawKey) {
  let keyChars = rawKey.toUpperCase().split('');

  //remove duplicate letters from the key
  let filteredKeyChars = [];
  for (let letter of keyChars) {
    //handle letter subsitution in the key (wrong letter total if only performed on the "fill letters")
    let newLetterAndNotOmittedLetter       = filteredKeyChars.indexOf(letter)===-1 && letter!=OMITTED_LETTER;
    let omittedLetterWithSubstituteMissing = filteredKeyChars.indexOf(SUBSTITUTE_LETTER)===-1 && letter==OMITTED_LETTER;

    if (newLetterAndNotOmittedLetter || omittedLetterWithSubstituteMissing) {
      if (letter!=OMITTED_LETTER) {
        filteredKeyChars.push(letter);
      } else {
        filteredKeyChars.push(SUBSTITUTE_LETTER);
      }
    }
  }

  return filteredKeyChars;
}

function createKeyMatrix(rawKey) {
  let keyChars  = reduceKey(rawKey);
  let keyMatrix = [];

  //collect all unused letters in order
  let unusedAlphabetChars = UPPERCASE_LETTERS.filter((char) => {
    return keyChars.indexOf(char) === -1 && char!=OMITTED_LETTER;
  });

  //matrix first filled with reduced key letters, then all other letters in alphabet
  for (let j=0;j<MATRIX_SIZE;j++) {
    keyMatrix.push([]);
    for (let i=0;i<MATRIX_SIZE;i++) {
      if (j*MATRIX_SIZE+i<keyChars.length) {
        keyMatrix[j].push(keyChars[j*MATRIX_SIZE+i]);
      } else {
        keyMatrix[j].push(unusedAlphabetChars[j*MATRIX_SIZE+i-keyChars.length]);
      }
    }
  }

  return keyMatrix;
}

function solveCipher(cipherText,rawKey) {
  let keyMatrix                   = createKeyMatrix(rawKey);
  let cipherChars                 = cipherText.split(" ").join('').split('');
  let cipherCharsPairs            = [];
  let cipherCharsPairsCoordinates = [];

  //split ciphertext into character pairs
  for (let i=0;i<cipherChars.length;i+=2) {
    cipherCharsPairs.push([cipherChars[i],cipherChars[i+1]]);
    cipherCharsPairsCoordinates.push([new Array(2),new Array(2)]);
  }

  //grab coordinates for the components of each character pair
  for (let k=0;k<cipherCharsPairs.length;k++) {
    for (let j=0;j<keyMatrix.length;j++) {
      for (let i=0;i<keyMatrix.length;i++) {
        if (keyMatrix[j][i]==cipherCharsPairs[k][0]) {
          cipherCharsPairsCoordinates[k][0] = [i,j];
        }

        if (keyMatrix[j][i]==cipherCharsPairs[k][1]) {
          cipherCharsPairsCoordinates[k][1] = [i,j];
        }
      }
    }
  }

  //decipher according to the 4 possible character pair scenarios (column/row/same/rectangle)
  let outputChars = [];
  for (let i=0;i<cipherCharsPairsCoordinates.length;i++) {
    let aInitial = cipherCharsPairsCoordinates[i][0];
    let bInitial = cipherCharsPairsCoordinates[i][1];

    let xAInitial = aInitial[0];
    let xBInitial = bInitial[0];

    let yAInitial = aInitial[1];
    let yBInitial = bInitial[1];

    let xA, xB;
    let yA, yB;

    if (xAInitial==xBInitial) { //check for columns
      xA = xAInitial;
      xB = xBInitial;

      yA = yAInitial - 1;
      yB = yBInitial - 1;

      //wrap around if either final y coordinate is off the grid
      if (yA==-1) {
        yA = keyMatrix.length-1;
      }

      if (yB==-1) {
        yB = keyMatrix.length-1;
      }
    } else if (yAInitial==yBInitial) { //check for rows
      xA = xAInitial - 1;
      xB = xBInitial - 1;

      yA = yAInitial;
      yB = yBInitial;

      //wrap around if either final x coordinate is off the grid
      if (xA==-1) {
        xA = keyMatrix.length-1;
      }

      if (xB==-1) {
        xB = keyMatrix.length-1;
      }
    } else { //otherwise, we have a rectangle
      xA = xBInitial; //switch x coordinates
      xB = xAInitial;

      yA = yAInitial; //do not switch y coordinates
      yB = yBInitial;
    }

    outputChars.push(keyMatrix[yA][xA]);
    outputChars.push(keyMatrix[yB][xB]);
  }

  //glue the resulting letter pairs into a string and return
  return outputChars.join('');
}

//TODO: add encryption capability
let rawKey     = "DEATH";
let cipherText = "ME IK QO TX CQ TE ZX CO MW QC TE HN FB IK ME HA KR QC UN GI KM AV";
console.log(solveCipher(cipherText,rawKey));
