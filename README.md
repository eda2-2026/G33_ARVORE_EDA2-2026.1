# Biblioteca Digital — Árvore AVL
Trabalho de Estrutura de Dados

## Estrutura do Projeto

```
biblioteca-avl/
├── README.md
└── src/
    ├── App.jsx                          ← Componente raiz e lógica principal
    ├── estruturas/
    │   └── ArvoreAVL.js                 ← Implementação completa da Árvore AVL
    ├── componentes/
    │   ├── VisualizadorArvore.jsx       ← Diagrama SVG da árvore
    │   └── CartaoLivro.jsx              ← Card visual de cada livro
    └── dados/
        └── acervo.js                    ← Dados iniciais e paleta de cores
```

## Estrutura de Dados: Árvore AVL

A Árvore AVL (Adelson-Velsky e Landis, 1962) é uma **BST auto-balanceada**
que mantém a diferença de altura entre sub-árvores (fator de balanceamento)
em no máximo ±1 para todo nó.

### Complexidades

| Operação    | AVL        | BST (pior caso) |
|-------------|-----------|-----------------|
| Busca       | O(log n)  | O(n)            |
| Inserção    | O(log n)  | O(n)            |
| Remoção     | O(log n)  | O(n)            |
| Listagem    | O(n)      | O(n)            |

### Rotações implementadas

- **LL (Rotação Simples Direita):** sub-árvore esq. pesada para esq.
- **RR (Rotação Simples Esquerda):** sub-árvore dir. pesada para dir.
- **LR (Rotação Dupla Esquerda-Direita):** sub-árvore esq. pesada para dir.
- **RL (Rotação Dupla Direita-Esquerda):** sub-árvore dir. pesada para esq.

### Chave de ordenação

O campo `isbn` (string) é usado como chave. ISBNs são sequenciais, o que
causaria degeneração em O(n) em uma BST comum — a AVL rebalanceia
automaticamente, mantendo O(log n) mesmo nesse caso.

## Funcionalidades

- **Acervo:** listagem ordenada por ISBN via percurso in-order
- **Adicionar:** inserção com rebalanceamento automático
- **Buscar ISBN:** busca O(log n) com destaque visual do nó
- **Visualizar Árvore:** diagrama SVG com fator de balanceamento por nó
- **Log de Operações:** histórico de INSERT, DELETE, SEARCH e UPDATE

## Como executar

```bash
# Crie um projeto Vite React e substitua os arquivos src/
npm create vite@latest biblioteca-avl -- --template react
cd biblioteca-avl
npm install
# Copie os arquivos de src/ para o projeto
npm run dev
```
## Membros do Grupo

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Bgrangeiro">
        <img src="https://github.com/Bgrangeiro.png" width="100px;" alt="Bgrangeiro"/><br />
        <sub><b>Bruno Henryque Grangeiro</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/jopesmp">
        <img src="https://github.com/jopesmp.png" width="100px;" alt="jopesmp"/><br />
        <sub><b>João Pedro Sampaio</b></sub>
      </a>
    </td>
  </tr>
</table>

## Vídeo apresentação
