import { add } from '../src'

const main = document.querySelector('main')!

main.innerHTML = `<h1>1 + 2 = ${add(1, 2)}</h1>`
