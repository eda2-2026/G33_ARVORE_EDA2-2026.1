// =============================================================
//  COMPONENTE: VisualizadorArvore
//  Renderiza a Árvore AVL como um diagrama SVG interativo.
//
//  Cada nó exibe:
//    - Últimos 5 dígitos do ISBN (identificador)
//    - Título abreviado do livro
//    - Fator de Balanceamento (fb) colorido:
//        verde  → fb = 0  (perfeitamente balanceado)
//        âmbar  → fb = ±1 (aceitável pela AVL)
//        vermelho → fb = ±2 (violação — não deve ocorrer)
// =============================================================

// ------------------------------------------------------------------
// Retorna a cor do fator de balanceamento conforme o valor
// ------------------------------------------------------------------
function corFB(fb) {
  if (fb === 0)       return "#1D9E75"; // verde — perfeito
  if (Math.abs(fb) === 1) return "#BA7517"; // âmbar — aceitável
  return "#E24B4A";                     // vermelho — violação AVL
}

// ------------------------------------------------------------------
// Componente principal
// Props:
//   arvore       — instância de ArvoreAVL
//   isbnDestaque — ISBN do nó a destacar visualmente (após busca)
// ------------------------------------------------------------------
function VisualizadorArvore({ arvore, isbnDestaque }) {
  // Obtém listas de nós e arestas já com coordenadas (x, y) calculadas
  const nos     = arvore.obterNosVisuais();
  const arestas = arvore.obterArestasVisuais();

  // Árvore vazia
  if (!arvore.raiz) {
    return (
      <div style={{
        textAlign: "center", padding: "40px",
        color: "var(--color-text-secondary)", fontSize: 14,
      }}>
        Árvore vazia — adicione livros para visualizar a estrutura
      </div>
    );
  }

  // Calcula o viewBox dinâmico com base nas posições dos nós
  const minX = Math.min(...nos.map(n => n.x)) - 36;
  const maxX = Math.max(...nos.map(n => n.x)) + 36;
  const maxY = Math.max(...nos.map(n => n.y)) + 50;
  const largura  = Math.max(740, maxX - minX);
  const altura   = maxY + 20;
  const offsetX  = minX < 0 ? -minX : 0; // desloca para não cortar à esquerda

  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg width={largura} height={altura} style={{ display: "block", minWidth: largura }}>

        {/* Definição da ponta de seta para as arestas */}
        <defs>
          <marker id="seta" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#B4B2A9" />
          </marker>
        </defs>

        {/* Renderiza as ARESTAS (linhas pai → filho) */}
        {arestas.map((a, i) => (
          <line
            key={i}
            x1={a.x1 + offsetX} y1={a.y1}
            x2={a.x2 + offsetX} y2={a.y2}
            stroke="#D3D1C7"
            strokeWidth="1.5"
            markerEnd="url(#seta)"
          />
        ))}

        {/* Renderiza os NÓS */}
        {nos.map((n, i) => {
          const destacado = isbnDestaque && n.livro.isbn === isbnDestaque;
          return (
            <g key={i} transform={`translate(${n.x + offsetX},${n.y})`}>
              {/* Círculo do nó — destaque em roxo se for o nó buscado */}
              <circle
                r={28}
                fill={destacado ? "#EEEDFE" : "var(--color-background-primary)"}
                stroke={destacado ? "#534AB7" : "#D3D1C7"}
                strokeWidth={destacado ? 2 : 1}
              />
              {/* ISBN abreviado (chave de ordenação) */}
              <text
                textAnchor="middle" y={-6}
                fontSize={9} fontWeight="500"
                fill="var(--color-text-primary)"
                style={{ fontFamily: "monospace" }}
              >
                {n.livro.isbn.slice(-5)}
              </text>
              {/* Título resumido */}
              <text textAnchor="middle" y={5} fontSize={8} fill="var(--color-text-secondary)">
                {n.livro.titulo.length > 9
                  ? n.livro.titulo.slice(0, 8) + "…"
                  : n.livro.titulo}
              </text>
              {/* Fator de Balanceamento — colorido conforme o valor */}
              <text
                textAnchor="middle" y={16}
                fontSize={9} fontWeight="500"
                fill={corFB(n.fb)}
              >
                fb={n.fb}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default VisualizadorArvore;
