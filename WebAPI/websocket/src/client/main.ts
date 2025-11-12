//src/client/main.ts
console.log("Hey ho, Captain Joe")

let toggle: boolean = false

const container = document.getElementById("mdview-root")
if (container) {
  container.addEventListener("click", () => {
		toggle = !toggle
     if (toggle){
			container.innerText = "Click, click"
		} else {
		  container.innerText = "Websocket Training loading..."
	  }
	}
)}
