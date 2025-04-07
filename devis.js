const commandeBody = document.getElementById("commandeBody");
const totalPrix = document.getElementById("totalPrix");
const livraison = document.getElementById("livraison");
const commandeForm = document.getElementById("commandeForm");

const modeLivraison = document.getElementById("mode");
const distanceInput = document.getElementById("distance");
const livraisonBloc = document.getElementById("livraisonBloc");

const prixHalteres = {
  2.5: 6.25, 5: 12.5, 7.5: 18, 10: 24, 12.5: 28.75,
  15: 34.5, 17.5: 38.5, 20: 44, 22.5: 47.25,
  25: 52.5, 27.5: 55, 30: 60
};

const prixDisques = {
  5: 12.5, 10: 24, 15: 34.5, 20: 44, 25: 52.5
};

const prixKettlebells = {
  4: 12, 6: 18, 8: 24, 12: 34.8, 16: 46.4,
  20: 56, 24: 67.2, 28: 75.6, 32: 86.4
};

const ordreHalteres = [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30];
const ordreDisques = [5, 10, 15, 20, 25];
const ordreKettlebells = [4, 6, 8, 12, 16, 20, 24, 28, 32];

function getPrix(produit, poids) {
  if (produit === 'halteres') return prixHalteres[poids] || 0;
  if (produit === 'disques') return prixDisques[poids] || 0;
  if (produit === 'kettlebells') return prixKettlebells[poids] || 0;
  return 0;
}

function toggleLivraisonBloc() {
  livraisonBloc.style.display = modeLivraison.value === "livraison" ? "block" : "none";
}

function createRow() {
  const row = document.createElement("tr");

  const produitCell = document.createElement("td");
  const produitSelect = document.createElement("select");
  produitSelect.innerHTML = `
    <option value="halteres">Haltères</option>
    <option value="disques">Disques</option>
    <option value="kettlebells">Kettlebells</option>
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
    let ordre = [];
    if (selected === 'halteres') ordre = ordreHalteres;
    else if (selected === 'disques') ordre = ordreDisques;
    else if (selected === 'kettlebells') ordre = ordreKettlebells;

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

  let fraisLivraison = 0;
  if (modeLivraison.value === "livraison") {
    const distance = parseFloat(distanceInput.value) || 0;
    fraisLivraison = total >= 300 ? 0 : 8 + distance * 0.5;
  }

  totalPrix.textContent = `💰 Total estimé : ${total.toFixed(2)} €`;
  livraison.textContent = fraisLivraison === 0
    ? `🚚 Livraison offerte !`
    : `🚚 Livraison estimée : ${fraisLivraison.toFixed(2)} €`;

  return { total, totalPoids, fraisLivraison };
}

document.querySelector(".add-line").addEventListener("click", createRow);
modeLivraison.addEventListener("change", () => {
  toggleLivraisonBloc();
  updateTotal();
});
distanceInput.addEventListener("input", updateTotal);
toggleLivraisonBloc();

commandeForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const nom = document.getElementById("nom").value;
  const email = document.getElementById("email").value;
  const tel = document.getElementById("telephone").value;
  const ville = modeLivraison.value === "livraison" ? document.getElementById("ville").value : "Non concerné (retrait)";
  const mode = modeLivraison.value === "retrait" ? "Retrait à Clarafond-Arcine" : "Livraison à domicile";
  const distance = distanceInput.value || "non précisée";
  const infos = document.getElementById("infos")?.value || "";

  const { total, totalPoids, fraisLivraison } = updateTotal();

  if (totalPoids < 50) {
    alert("Le minimum de commande est de 50 kg. Merci d'ajuster votre demande.");
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

Mode choisi : ${mode}
Distance estimée : ${distance} km

Produits :
${details}

Poids total : ${totalPoids} kg
Total estimé : ${total.toFixed(2)} €
Livraison estimée : ${fraisLivraison === 0 ? "offerte" : fraisLivraison.toFixed(2) + " €"}

Informations supplémentaires :
${infos || "Aucune"}
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
