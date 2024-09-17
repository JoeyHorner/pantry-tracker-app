import { collection, getDocs } from "firebase/firestore";
import { firestore } from "./app/firebase";

export async function fetchRecipeSuggestions(cuisineType) {
    const querySnapshot = await getDocs(collection(firestore, 'pantry'));
    console.log("querySnapshot:", querySnapshot);
    console.log("querySnapshot.docs:", querySnapshot.docs);
    const items = [];
    querySnapshot.forEach((doc) => {

        items.push(`${doc.id} (${doc.data().quantity})`);
      });
      console.log("items array:", items)
  // Generate query string from items
  const query = items.join(", ");
  console.log("query array:",query)
    let response;
    if (cuisineType && cuisineType.trim() !== "") {
      // If cuisineType is provided, include it in the request body
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              "model": "mattshumer/reflection-70b:free",
              "messages": [
                  {"role": "user", "content": `Suggest ${cuisineType} recipes using the following ingredients: ${query}`}
              ]
          })
      });
    } else {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "mattshumer/reflection-70b:free",
        "messages": [
            {"role": "user", "content": `Suggest recipes using the following ingredients: ${query}`}
          ]
        })
      });
    }   
  const data = await response.json();
  return data;
}