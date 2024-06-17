document.addEventListener('DOMContentLoaded', () => {
    fetchPokemons();
    setupEventListeners();
});

let allPokemons = []; // Almacena todos los Pokémon para filtrar
let nextPageUrl = 'https://pokeapi.co/api/v2/pokemon?limit=150'; // URL inicial para los primeros 150 Pokémon

async function fetchPokemons() {
    if (!nextPageUrl) return; // Si no hay más páginas, detiene la función
    try {
        const response = await fetch(nextPageUrl);
        const data = await response.json();
        const pokemonDetails = await Promise.all(data.results.map(pokemon => fetchPokemonData(pokemon.url)));
        allPokemons.push(...pokemonDetails);
        displayPokemons(allPokemons);
        nextPageUrl = data.next; // Actualiza la URL de la próxima página
        document.getElementById('load-more').style.display = nextPageUrl ? 'block' : 'none'; // Muestra o oculta el botón
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
}

function setupEventListeners() {
    document.getElementById('load-more').addEventListener('click', fetchPokemons);
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.querySelectorAll('.type-button').forEach(button => {
        button.addEventListener('click', () => filterByType(button.getAttribute('data-type')));
    });
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('pokemon-modal').classList.add('hidden');
    });
}

function handleSearch(event) {
    const searchText = event.target.value.toLowerCase();
    const filteredPokemons = allPokemons.filter(pokemon => {
        return pokemon.name.toLowerCase().includes(searchText) || pokemon.types.some(type => type.type.name.toLowerCase().includes(searchText));
    });
    displayPokemons(filteredPokemons);
}

function filterByType(type) {
    const filteredPokemons = type === 'all' ? allPokemons : allPokemons.filter(pokemon => pokemon.types.some(t => t.type.name.toLowerCase() === type));
    displayPokemons(filteredPokemons);
}

const fetchPokemonData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return {
        name: data.name,
        sprites: data.sprites,
        types: data.types,
        weight: data.weight,
        height: data.height,
        moves: data.moves.slice(0, 10) // Limita a los primeros 10 movimientos por simplicidad
    };
};

function displayPokemons(pokemons) {
    const container = document.getElementById('pokemon-container');
    container.innerHTML = ''; // Limpia el contenedor antes de mostrar nuevos Pokémon
    pokemons.forEach(pokemon => container.appendChild(createPokemonCard(pokemon)));
}

function createPokemonCard(pokemon) {
    const type = pokemon.types[0].type.name;
    const color = getColorFromType(getTypeColor(type));
    const imageUrl = pokemon.sprites.front_default;
    const card = document.createElement('div');
    card.style.backgroundColor = color; // Aplica el color de fondo
    card.className = `m-2 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer`;
    card.innerHTML = `
        <img src="${imageUrl}" alt="${pokemon.name}" class="h-20 w-20">
        <h2 class="font-bold">${pokemon.name.toUpperCase()}</h2>
        <p>Type: ${type.toUpperCase()}</p>
    `;
    card.addEventListener('click', () => showPokemonDetails(pokemon));
    return card;
}

function showPokemonDetails(pokemon) {
    const modal = document.getElementById('pokemon-modal');
    const modalContent = modal.querySelector('.modal-content');
    const typeColor = getColorFromType(getTypeColor(pokemon.types[0].type.name));

    modalContent.style.backgroundColor = typeColor; // Aplica el color al contenido del modal

    // Asegúrate de que el nombre del Pokémon esté centrado y en mayúsculas
    const pokemonNameElement = document.getElementById('pokemon-name');
    pokemonNameElement.textContent = pokemon.name;
    pokemonNameElement.className = 'text-2xl font-bold uppercase text-center block w-full'; // Asegura centrado y estilos

    document.getElementById('pokemon-image').src = pokemon.sprites.front_default;
    document.getElementById('pokemon-type').textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;
    document.getElementById('pokemon-stats').innerHTML = `
        Weight: ${pokemon.weight / 10} kg<br>
        Height: ${pokemon.height / 10} m<br>
        Moves: ${pokemon.moves.map(move => move.move.name).join(', ')}
    `;
    modal.classList.remove('hidden');
}



function getTypeColor(type) {
    const typeColors = {
        normal: 'gray', fire: 'red', water: 'blue', electric: 'yellow', grass: 'green', ice: 'teal',
        fighting: 'orange', poison: 'purple', ground: 'amber', flying: 'indigo', psychic: 'pink', 
        bug: 'lime', rock: 'stone', ghost: 'indigo', dragon: 'violet', dark: 'gray-800', 
        steel: 'blue-gray', fairy: 'pink-300'
    };
    return typeColors[type] || 'gray';
}

function getColorFromType(colorName) {
    const colors = {
        'gray': '#D1D5DB',
        'red': '#EF4444',
        'blue': '#3B82F6',
        'yellow': '#F59E0B',
        'green': '#10B981',
        'teal': '#14B8A6',
        'orange': '#F97316',
        'purple': '#A855F7',
        'amber': '#FCD34D',
        'indigo': '#6366F1',
        'pink': '#EC4899',
        'lime': '#84CC16',
        'stone': '#78716C',
        'violet': '#8B5CF6',
        'gray-800': '#1F2937',
        'blue-gray': '#64748B',
        'pink-300': '#D685AD'
    };
    return colors[colorName]; // Devuelve el valor de color correspondiente
}
