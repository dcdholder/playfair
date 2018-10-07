//let KNOWN_KEY_LENGTH  = 5;
let MATRIX_SIZE       = 5;
let UPPERCASE_LETTERS = String.fromCharCode(...Array(91).keys()).slice(65).split('');
let ALL_WORDS         = require('./words.json');

function createKeyMatrix(key) {
  let keyChars  = key.split('');
  let keyMatrix = [];

  let unusedAlphabetChars = UPPERCASE_LETTERS.filter((char) => {
    return keyChars.indexOf(char) === -1;
  });
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

//begin and end parameters used in a concurrent implementation
//can be left blank to search entire space
function bruteForceCipher(cipherText,begin,end) {
  let bestKey;
  let bestResults;

  if (!begin) {
    begin = 0;
  }

  if (!end) {
    end = ALL_WORDS.length-1;
    //end = Math.floor(Math.pow(26,KNOWN_KEY_LENGTH))-1;
  }

  for (let i=begin; i<=end; i++) {
    let key            = generatePossibleKey(i);
    let keyMatrix      = createKeyMatrix(key);
    let attemptResults = solveCipher(cipherText,keyMatrix);

    if (!bestResults || englishnessScore(attemptResults) > bestResults) {
      bestKey     = key;
      bestResults = attemptResults;
    }
  }

  return [bestKey,bestResults];
}

function englishnessScore(str) {
  let englishnessScore = 0;

  let words = str.split(' ');
  for (word of words) {
    if (word in ALL_WORDS) {
      englishnessScore+=1;
    }
  }

  return englishnessScore;
}

//keys generated one-by-one to allow concurrent implementations
function generatePossibleKey(i) {
  return ALL_WORDS[i];
}

//TODO: reuse this to allow non-word keys - probably very slow
/*
//generate single keys on demand to save on memory
function generatePossibleKey(keyIndex) {
  let keyChars = [];

  let letterIndexes = base26Conversion(keyIndex);
  for (let i=0;i<letterIndexes.length;i++) {
    keyChars.push(UPPERCASE_LETTERS[letterIndexes[i]]);
  }

  return keyChars.join();
}

function base26Conversion(int) {
  let tmpInt = int;

  let base26Digits = [];
  while (tmpInt>0) {
    base26Digits.push(tmpInt%26);
    tmpInt = Math.floor(tmpInt/26);
  }

  return tmpInt;
}
*/

function solveCipher(cipherText,keyMatrix) {
  let cipher                      = cipher.split(" ").join();
  let cipherChars                 = cipherText.split('');
  let cipherCharsPairs            = [];
  let cipherCharsPairsCoordinates = [];

  //split ciphertext into character pairs
  for (let i=0;i<cipherChars.length;i+=2) {
    cipherCharsPairs.push([cipherChars[i],cipherChars[i+1]]);
    cipherCharsPairsCoordinates.push([new Array(2)]);
  }

  //grab coordinates for the components of each character pair
  for (let k=0;k<cipherCharsPairs.length;k++) {
    for (let j=0;j<keyMatrix.length;j++) {
      for (let i=0;i<keyMatrix.length;i++) {
        if (keyMatrix[j][i]==cipherChars[k][0]) {
          cipherCharsPairsCoordinates[k][0] = [i,j];
        } else if (keyMatrix[j][i]==cipherChars[k][1]) {
          cipherCharsPairsCoordinates[k][1] = [i,j];
        }
      }
    }
  }

  //decipher according to the 4 possible character pair scenarios (column/row/same/rectangle)
  for (let i=0;i<cipherCharsPairsCoordinates.length;i++) {
    let aInitial = cipherCharsPairsCoordinates[i][0];
    let bInitial = cipherCharsPairsCoordinates[i][1];

    let xAInitial = aInitial[0];
    let xBInitial = bInitial[0];

    let yAInitial = aInitial[1];
    let yBInitial = bInitial[1];

    if (xAInitial==xBInitial) { //check for columns
      let xA = xAInitial;
      let xB = xBInitial;

      let yA = yAInitial + 1;
      let yB = yBInitial + 1;

      //wrap around if either final x coordinate is off the grid
      if (xAInitial==keyMatrix.length) {
        xA = 0;
      }

      if (xBInitial==keyMatrix.length) {
        xB = 0;
      }
    } else if (yAInitial==yBInitial) { //check for rows
      let xA = xAInitial + 1;
      let xB = xBInitial + 1;

      let yA = yAInitial;
      let yB = yBInitial;

      //wrap around if either final x coordinate is off the grid
      if (yAInitial==keyMatrix.length) {
        yA = 0;
      }

      if (yBInitial==keyMatrix.length) {
        yB = 0;
      }
    } else { //otherwise, we have a rectangle
      let xA = xBInitial; //switch x coordinates
      let xB = xAInitial;

      let yA = yAInitial; //do not switch y coordinates
      let yB = yBInitial;
    }

    outputCharPairs.push([keyMatrix[y0][x0],keyMatrix[y1][x1]]);
  }

  //glue the resulting letter pairs into a string and return
  return outputCharPairs.join();
}

let cipherText = "ME IK QO TX CQ TE ZX CO MW QC TE HN FB IK ME HA KR QC UN GI KM AV";
console.log(bruteForceCipher(cipherText)[1]);
