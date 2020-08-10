
import {myf} from './modules/mod1.mjs';

const myInp = document.querySelector("#my-inp");

myInp.oninput = function (e) {
  myf(e.target.value);
};

myf(myInp.value);
