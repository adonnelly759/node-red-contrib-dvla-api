function convertPlate(reg){
    let plateSub = reg.substring(0,3)
    if(hasNumber(plateSub)){
      // XXXX XXX
      return `${reg.substring(0,4)} ${reg.substring(4)}`
    } else {
      // XXX XXXX
      return `${reg.substring(0,3)} ${reg.substring(3)}`
    }
}

function hasNumber(myString) {
    return /\d/.test(myString);
}