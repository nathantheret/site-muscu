const commandeBody = document.getElementById("commandeBody");
const totalPrix = document.getElementById("totalPrix");
const livraison = document.getElementById("livraison");
const commandeForm = document.getElementById("commandeForm");
const detailsHidden = document.getElementById("detailsHidden");

const prixHalteres = {
  2.5: 6.25, 5: 12.5, 7.5: 18, 10: 24, 12.5: 28.75,
  15: 34.5, 17.5: 38.5, 20: 44, 22.5: 47.25,
  25: 52.5, 27.5: 55, 30: 60
};




const prixDisques = {
  5: 12.5, 10: 24, 15: 34.5, 20: 44, 25: 52.5
};

const ordreHalteres = [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30];
const ordreDisques = [5, 10, 15, 20, 25];

function getPrix(produit, poids) {
  const map = produit === 'halteres' ? prixHalteres : prixDisques;
  return map[poids] || 0;
}

function createRow() {
  const row = document.createElement("tr");

  const produitCell = document.createElement("td");
  const produitSelect = document.createElement("select");
  produitSelect.innerHTML = `
    <option value="halteres">Haltères</option>
    <option value="disques">Disques</option>
  `;
  produitCell.appendChild(produitSelect);

  const poidsCell = document.createElement("td");
  const poidsSelect = document.createElement("select");
  poidsCell.appendChild(poidsSelect);

  const quantiteCell = document.createElement("td");
  const quantiteInput = document.createElement("input");
  quantiteInput.type = "number";
  quantiteInput.min = 1;
  quantiteInput.value = 1;
  quantiteCell.appendChild(quantiteInput);

  const subtotalCell = document.createElement("td");
  subtotalCell.textContent = "0 €";

  const removeCell = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.className = "btn";
  removeBtn.type = "button";
  removeBtn.onclick = () => {
    row.remove();
    updateTotal();
  };
  removeCell.appendChild(removeBtn);

  row.append(produitCell, poidsCell, quantiteCell, subtotalCell, removeCell);
  commandeBody.appendChild(row);

  function updatePoidsOptions() {
    const selected = produitSelect.value;
    const ordre = selected === 'halteres' ? ordreHalteres : ordreDisques;
    poidsSelect.innerHTML = "";
    ordre.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = `${p} kg`;
      poidsSelect.appendChild(opt);
    });
    updateSubtotal();
  }

  function updateSubtotal() {
    const produit = produitSelect.value;
    const poids = parseFloat(poidsSelect.value);
    const qty = parseInt(quantiteInput.value);
    const prix = getPrix(produit, poids);
    const total = prix * qty;
    subtotalCell.textContent = `${total.toFixed(2)} €`;
    updateTotal();
  }

  produitSelect.addEventListener("change", () => {
    updatePoidsOptions();
    updateSubtotal();
  });
  poidsSelect.addEventListener("change", updateSubtotal);
  quantiteInput.addEventListener("input", updateSubtotal);

  updatePoidsOptions();
}

function updateTotal() {
  let total = 0;
  let totalPoids = 0;

  commandeBody.querySelectorAll("tr").forEach(row => {
    const produit = row.children[0].firstChild.value;
    const poids = parseFloat(row.children[1].firstChild.value);
    const qty = parseInt(row.children[2].firstChild.value);
    const prix = getPrix(produit, poids);
    total += prix * qty;
    totalPoids += poids * qty;
  });

  const fraisLivraison = total >= 200 ? 0 : totalPoids * 0.1;

  totalPrix.textContent = `💰 Total estimé : ${total.toFixed(2)} €`;
  livraison.textContent = fraisLivraison === 0
    ? `🚚 Livraison offerte !`
    : `🚚 Livraison estimée : ${fraisLivraison.toFixed(2)} €`;

  return { total, totalPoids, fraisLivraison };
}

document.querySelector(".add-line").addEventListener("click", createRow);

commandeForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const nom = document.getElementById("nom").value;
  const email = document.getElementById("email").value;
  const tel = document.getElementById("telephone").value;
  const ville = document.getElementById("ville").value;

  const { total, totalPoids, fraisLivraison } = updateTotal();

  if (totalPoids <= 0) {
    alert("Merci de demander un minimum de poids pour établir un devis.");
    return;
  }

  let details = "";
  commandeBody.querySelectorAll("tr").forEach((row, index) => {
    const produit = row.children[0].firstChild.value;
    const poids = row.children[1].firstChild.value;
    const qty = row.children[2].firstChild.value;
    details += `Produit ${index + 1} : ${produit}, ${poids} kg x ${qty}\n`;
  });

  const body = `
Nom : ${nom}
Email : ${email}
Téléphone : ${tel}
Ville : ${ville}

Demande de devis :
${details}

Poids total : ${totalPoids} kg
Total estimé : ${total.toFixed(2)} €
Livraison estimée : ${fraisLivraison === 0 ? "offerte" : fraisLivraison.toFixed(2) + " €"}
  `;

  const formData = new FormData();
  formData.append("Nom", nom);
  formData.append("Email", email);
  formData.append("Téléphone", tel);
  formData.append("Ville", ville);
  formData.append("Commande", body);

  try {
    const response = await fetch("https://formspree.io/f/myzendnq", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      window.location.href = "confirmation.html";
    } else {
      alert("Erreur lors de l'envoi de la demande. Veuillez réessayer.");
    }
  } catch (error) {
    alert("Une erreur s’est produite. Vérifiez votre connexion ou contactez-moi directement.");
  }
});

createRow();
