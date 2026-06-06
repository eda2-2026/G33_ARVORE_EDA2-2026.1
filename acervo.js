// =============================================================
//  DADOS INICIAIS DO ACERVO
//  Livros pré-carregados para demonstração do sistema
//  O ISBN é usado como CHAVE de ordenação na Árvore AVL
// =============================================================

// Acervo inicial — inseridos na árvore na ordem abaixo.
// Por serem ISBNs crescentes, uma BST comum degeneraria em lista
// linear (pior caso O(n)). A AVL rebalanceia automaticamente,
// mantendo O(log n) garantido.
export const acervoInicial = [
  {
    isbn:      "978-85-01",
    titulo:    "Dom Casmurro",
    autor:     "Machado de Assis",
    ano:       1899,
    genero:    "Romance",
    disponivel: true,
  },
  {
    isbn:      "978-85-02",
    titulo:    "Grande Sertão: Veredas",
    autor:     "João Guimarães Rosa",
    ano:       1956,
    genero:    "Romance",
    disponivel: true,
  },
  {
    isbn:      "978-85-03",
    titulo:    "Iracema",
    autor:     "José de Alencar",
    ano:       1865,
    genero:    "Romance",
    disponivel: false,
  },
  {
    isbn:      "978-85-04",
    titulo:    "Memórias Póstumas de Brás Cubas",
    autor:     "Machado de Assis",
    ano:       1881,
    genero:    "Romance",
    disponivel: true,
  },
  {
    isbn:      "978-85-05",
    titulo:    "Vidas Secas",
    autor:     "Graciliano Ramos",
    ano:       1938,
    genero:    "Romance",
    disponivel: true,
  },
  {
    isbn:      "978-85-06",
    titulo:    "O Cortiço",
    autor:     "Aluísio Azevedo",
    ano:       1890,
    genero:    "Naturalismo",
    disponivel: false,
  },
  {
    isbn:      "978-85-07",
    titulo:    "Calunga",
    autor:     "Jorge de Lima",
    ano:       1935,
    genero:    "Modernismo",
    disponivel: true,
  },
];

// Mapeamento de gêneros para paleta de cores visual
// Cada gênero recebe fundo (bg), texto (text) e borda (border)
export const coresGenero = {
  "Romance":     { bg: "#E1F5EE", text: "#085041", border: "#0F6E56" },
  "Naturalismo": { bg: "#FAECE7", text: "#4A1B0C", border: "#993C1D" },
  "Modernismo":  { bg: "#EEEDFE", text: "#26215C", border: "#534AB7" },
  "Ficção":      { bg: "#E6F1FB", text: "#042C53", border: "#185FA5" },
  "Poesia":      { bg: "#FBEAF0", text: "#4B1528", border: "#993556" },
  "Técnico":     { bg: "#FAEEDA", text: "#412402", border: "#854F0B" },
};

// Cor padrão para gêneros não mapeados
export const corPadrao = { bg: "#F1EFE8", text: "#2C2C2A", border: "#5F5E5A" };

// Retorna a cor do gênero ou a cor padrão
export const obterCorGenero = (genero) =>
  coresGenero[genero] ?? corPadrao;

// Lista de gêneros disponíveis para o formulário
export const generosDisponiveis = [
  "Romance", "Naturalismo", "Modernismo",
  "Ficção", "Poesia", "Técnico",
];
