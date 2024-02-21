const myDate = document.getElementById("myDate")
const date = new Date();

const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Přidání nuly pro jednociferný měsíc
const day = date.getDate().toString().padStart(2, '0'); // Přidání nuly pro jednociferný den

const formattedDate = `${year}-${month}-${day}`;

const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 21);

const yearMax = maxDate.getFullYear();
const monthMax = (maxDate.getMonth() + 1).toString().padStart(2, '0'); // Přidání nuly pro jednociferný měsíc
const dayMax = maxDate.getDate().toString().padStart(2, '0'); // Přidání nuly pro jednociferný den

const formattedDateMax = `${yearMax}-${monthMax}-${dayMax}`;

// myDate.value = formattedDate;
myDate.min = formattedDate;

myDate.max = formattedDateMax;