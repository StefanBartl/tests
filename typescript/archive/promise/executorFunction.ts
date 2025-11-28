const myExecutor = (
  resolved: (value: string) => void,
  rejected: (reason?: string) => void,
): void => {
  try {
    // Hier kann code implementiert werden, der ausgeführt werden soll. Sollte kein Error oder Exception auftauchen, wird resolved() aufgerufen...
    // Code...

    // Als Abschluss der Aufruf von resolve()
    resolved("Die Ausführung des Codes hat funktioniert.");
  } catch (error) {
    // Sollte ein Fehler oder Exception im try scope auftauchen, wird dieser über das `error`-Argument weitergegeben und rejected() aufgerufen...
    const e = error as NodeJS.ErrnoException;
    console.error(e.name);
    console.error(e.code);
    console.error(e.message);
    console.error(e.path);
    console.error(e.syscall);
    console.error(e.stack);
    rejected("Die Ausführung des Codes hat nicht funktionert.")
  }
};

const myPromise = new Promise(myExecutor);
myPromise.then(
    (val)=>{
      console.info(val)
    }
)
