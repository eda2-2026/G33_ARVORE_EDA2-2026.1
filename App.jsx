// =============================================================
//  APP PRINCIPAL — Biblioteca Digital com Árvore AVL
//  Trabalho de Estrutura de Dados
//
//  Fluxo de dados:
//    - Uma instância de ArvoreAVL é mantida em useRef (persiste
//      entre renders sem causar re-render sozinha).
//    - O estado React `livros` é uma cópia "snapshot" da AVL,
//      atualizada via refreshLivros() após cada operação.
//    - Todas as operações (inserir, remover, buscar) modificam
//      diretamente a AVL e depois atualizam o estado.
// =============================================================

import { useState, useEffect, useRef } from "react";
import ArvoreAVL                        from "./estruturas/ArvoreAVL";
import { acervoInicial, obterCorGenero, generosDisponiveis } from "./dados/acervo";
import VisualizadorArvore               from "./componentes/VisualizadorArvore";
import CartaoLivro                      from "./componentes/CartaoLivro";

// Cores para o log de operações por tipo
const COR_LOG = { sucesso: "#1D9E75", aviso: "#BA7517", info: "#378ADD", erro: "#E24B4A" };

// ------------------------------------------------------------------
// Componente raiz
// ------------------------------------------------------------------
export default function App() {
  // Instância da AVL — useRef evita recriar a árvore a cada render
  const arvoreRef = useRef(new ArvoreAVL());

  // Estado React: snapshot dos livros (para re-render da UI)
  const [livros,        setLivros]        = useState([]);
  const [visao,         setVisao]         = useState("acervo");
  const [filtroBusca,   setFiltroBusca]   = useState("");
  const [isbnDestaque,  setIsbnDestaque]  = useState(null);
  const [resultadoBusca, setResultadoBusca] = useState(null);
  const [campoBusca,    setCampoBusca]    = useState("");
  const [toast,         setToast]         = useState(null);
  const [log,           setLog]           = useState([]);

  // Estado do formulário de inserção
  const [form, setForm] = useState({
    isbn: "", titulo: "", autor: "", ano: "", genero: "Romance",
  });

  // Adiciona uma entrada ao log de operações (máx. 20 entradas)
  const adicionarLog = (msg, tipo = "info") =>
    setLog(l => [{ msg, tipo, hora: new Date().toLocaleTimeString("pt-BR") }, ...l.slice(0, 19)]);

  // Exibe um toast temporário por 3 segundos
  const exibirToast = (msg, tipo = "sucesso") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Inicialização ----

  // Carrega o acervo inicial na AVL ao montar o componente
  useEffect(() => {
    acervoInicial.forEach(livro => arvoreRef.current.inserir(livro));
    setLivros(arvoreRef.current.listarOrdenado());
    adicionarLog(`Sistema iniciado com ${acervoInicial.length} livros`, "info");
    adicionarLog("Árvore AVL construída e balanceada automaticamente", "sucesso");
  }, []);

  // Sincroniza o estado React com o conteúdo atual da AVL
  const refreshLivros = () => setLivros(arvoreRef.current.listarOrdenado());

  // ---- Operações na Árvore AVL ----

  // INSERÇÃO — O(log n)
  const handleInserir = () => {
    const { isbn, titulo, autor, ano, genero } = form;

    if (!isbn || !titulo || !autor || !ano)
      return exibirToast("Preencha todos os campos obrigatórios", "erro");

    if (arvoreRef.current.buscar(isbn))
      return exibirToast("ISBN já cadastrado na árvore", "erro");

    const novoLivro = { isbn, titulo, autor, ano: parseInt(ano), genero, disponivel: true };

    // Insere na AVL — rotações de rebalanceamento são automáticas
    arvoreRef.current.inserir(novoLivro);
    refreshLivros();

    // Destaca o novo nó na visualização por 2 segundos
    setIsbnDestaque(isbn);
    setTimeout(() => setIsbnDestaque(null), 2000);

    setForm({ isbn: "", titulo: "", autor: "", ano: "", genero: "Romance" });
    exibirToast(`"${titulo}" adicionado com sucesso`);
    adicionarLog(`INSERT: "${titulo}" (${isbn}) — AVL rebalanceada`, "sucesso");
  };

  // REMOÇÃO — O(log n)
  const handleRemover = (isbn, titulo) => {
    arvoreRef.current.remover(isbn);
    refreshLivros();
    exibirToast(`"${titulo}" removido`);
    adicionarLog(`DELETE: "${titulo}" (${isbn}) — rotações aplicadas se necessário`, "aviso");
    if (resultadoBusca?.isbn === isbn) setResultadoBusca(null);
  };

  // ALTERNAR DISPONIBILIDADE — UPDATE no objeto (sem reestruturar a AVL)
  const handleAlternar = (isbn) => {
    const livro = arvoreRef.current.buscar(isbn);
    if (livro) {
      livro.disponivel = !livro.disponivel;
      refreshLivros();
      adicionarLog(`UPDATE: "${livro.titulo}" → ${livro.disponivel ? "disponível" : "emprestado"}`, "info");
    }
  };

  // BUSCA POR ISBN — O(log n)
  const handleBuscar = () => {
    const resultado = arvoreRef.current.buscar(campoBusca.trim());
    setResultadoBusca(resultado ?? "nao_encontrado");

    if (resultado) {
      // Calcula número esperado de comparações: ⌈log₂(n+1)⌉
      const comparacoes = Math.ceil(Math.log2(livros.length + 1));
      setIsbnDestaque(resultado.isbn);
      setTimeout(() => setIsbnDestaque(null), 3000);
      adicionarLog(`BUSCA O(log n): "${campoBusca}" encontrado em ≤${comparacoes} comparações`, "sucesso");
    } else {
      adicionarLog(`BUSCA O(log n): "${campoBusca}" não encontrado`, "aviso");
    }
  };

  // ---- Derivados ----

  // Filtra por título usando busca O(n) na AVL (título não é chave)
  const livrosFiltrados = filtroBusca
    ? arvoreRef.current.buscarPorTitulo(filtroBusca)
    : livros;

  const totalLivros    = livros.length;
  const qtdDisponiveis = livros.filter(l => l.disponivel).length;
  const alturaArvore   = arvoreRef.current.altura(arvoreRef.current.raiz);

  // Itens do menu de navegação
  const navItens = [
    { id: "acervo",       label: "Acervo",           icone: "ti-books"       },
    { id: "adicionar",    label: "Adicionar",         icone: "ti-plus"        },
    { id: "buscar",       label: "Buscar ISBN",       icone: "ti-search"      },
    { id: "arvore",       label: "Visualizar Árvore", icone: "ti-binary-tree" },
    { id: "log",          label: "Log de Operações",  icone: "ti-terminal"    },
  ];

  // ---- Render ----

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 900, margin: "0 auto", padding: "0 0 60px" }}>

      {/* ===== CABEÇALHO COM MÉTRICAS ===== */}
      <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 500, margin: 0, letterSpacing: "-0.5px" }}>
            Biblioteca Digital
          </h1>
          <span style={{
            fontSize: 12, background: "#EEEDFE", color: "#3C3489",
            padding: "2px 10px", borderRadius: 20, fontFamily: "monospace",
          }}>
            AVL Tree
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
          Gerenciamento de acervo com busca O(log n) garantida pela Árvore AVL
        </p>

        {/* Cards de métricas — valores derivados do estado da AVL */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 20 }}>
          {[
            { label: "Total de livros",   valor: totalLivros,                   bg: "#EEEDFE", cor: "#3C3489" },
            { label: "Disponíveis",       valor: qtdDisponiveis,                bg: "#E1F5EE", cor: "#085041" },
            { label: "Emprestados",       valor: totalLivros - qtdDisponiveis,  bg: "#FAEEDA", cor: "#633806" },
            { label: "Altura da árvore",  valor: alturaArvore,                  bg: "#F1EFE8", cor: "#444441" },
          ].map((m, i) => (
            <div key={i} style={{ background: m.bg, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: m.cor, opacity: 0.75, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: m.cor }}>{m.valor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MENU DE NAVEGAÇÃO ===== */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
        {navItens.map(item => (
          <button
            key={item.id}
            onClick={() => setVisao(item.id)}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "0.5px solid",
              borderColor: visao === item.id ? "#534AB7" : "var(--color-border-tertiary)",
              background:  visao === item.id ? "#EEEDFE"  : "transparent",
              color:       visao === item.id ? "#3C3489"  : "var(--color-text-primary)",
              fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <i className={`ti ${item.icone}`} style={{ fontSize: 15 }} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      {/* ===== TOAST DE NOTIFICAÇÃO ===== */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.tipo === "erro" ? "#FCEBEB" : "#E1F5EE",
          color:      toast.tipo === "erro" ? "#791F1F" : "#085041",
          border:     `0.5px solid ${toast.tipo === "erro" ? "#F09595" : "#5DCAA5"}`,
          padding: "10px 18px", borderRadius: 10, fontSize: 13, maxWidth: 280,
        }}>
          {toast.msg}
        </div>
      )}

      {/* ================================================================
          VISÃO: ACERVO
          Lista todos os livros em ordem crescente de ISBN (in-order)
          Permite filtrar por título, alterar disponibilidade e remover
      ================================================================ */}
      {visao === "acervo" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <input
              value={filtroBusca}
              onChange={e => setFiltroBusca(e.target.value)}
              placeholder="Filtrar por título..."
              style={{
                flex: 1, padding: "8px 12px", fontSize: 13, borderRadius: 8,
                border: "0.5px solid var(--color-border-tertiary)",
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            />
            {filtroBusca && (
              <button
                onClick={() => setFiltroBusca("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
              >
                <i className="ti ti-x" style={{ fontSize: 16 }} />
              </button>
            )}
          </div>

          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}>
            {livrosFiltrados.length} {livrosFiltrados.length === 1 ? "livro" : "livros"}
            {!filtroBusca && " — ordenados por ISBN via percurso in-order da AVL"}
          </div>

          {/* Renderiza um CartaoLivro para cada livro filtrado */}
          {livrosFiltrados.map(livro => (
            <CartaoLivro
              key={livro.isbn}
              livro={livro}
              corGenero={obterCorGenero(livro.genero)}
              aoRemover={handleRemover}
              aoAlternarDisp={handleAlternar}
            />
          ))}

          {livrosFiltrados.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)", fontSize: 14 }}>
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          VISÃO: ADICIONAR
          Formulário para inserir um novo livro na Árvore AVL
      ================================================================ */}
      {visao === "adicionar" && (
        <div style={{ maxWidth: 520 }}>
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 14, padding: 24,
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 500 }}>
              Inserir na Árvore AVL
            </h2>

            {/* Campos do formulário */}
            {[
              { chave: "isbn",   rotulo: "ISBN — chave de ordenação da AVL", placeholder: "978-XX-XXX"     },
              { chave: "titulo", rotulo: "Título",                           placeholder: "Título do livro" },
              { chave: "autor",  rotulo: "Autor",                            placeholder: "Nome do autor"   },
              { chave: "ano",    rotulo: "Ano de publicação",                placeholder: "1900"            },
            ].map(campo => (
              <div key={campo.chave} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>
                  {campo.rotulo}
                </label>
                <input
                  value={form[campo.chave]}
                  onChange={e => setForm({ ...form, [campo.chave]: e.target.value })}
                  placeholder={campo.placeholder}
                  style={{
                    width: "100%", padding: "8px 12px", fontSize: 13,
                    borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)",
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}

            {/* Seletor de gênero */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>
                Gênero
              </label>
              <select
                value={form.genero}
                onChange={e => setForm({ ...form, genero: e.target.value })}
                style={{
                  width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: 8,
                  border: "0.5px solid var(--color-border-tertiary)",
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {generosDisponiveis.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Botão de inserção */}
            <button
              onClick={handleInserir}
              style={{
                width: "100%", padding: "10px", borderRadius: 9,
                border: "0.5px solid #534AB7", background: "#EEEDFE",
                color: "#3C3489", fontSize: 14, cursor: "pointer", fontWeight: 500,
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: 14, marginRight: 6 }} aria-hidden="true" />
              Inserir na Árvore AVL
            </button>
          </div>

          {/* Nota explicativa sobre o processo de balanceamento */}
          <div style={{
            marginTop: 16, padding: "12px 16px",
            background: "var(--color-background-secondary)",
            borderRadius: 10, fontSize: 12, color: "var(--color-text-secondary)",
          }}>
            <strong style={{ color: "var(--color-text-primary)" }}>Como funciona:</strong> O ISBN é
            comparado recursivamente até encontrar a posição correta. Após inserção, a AVL recalcula
            os fatores de balanceamento (fb) em cada nó do caminho e executa rotações simples ou
            duplas onde |fb| &gt; 1, mantendo altura O(log n) garantida.
          </div>
        </div>
      )}

      {/* ================================================================
          VISÃO: BUSCAR
          Demonstra a busca O(log n) por ISBN na Árvore AVL
      ================================================================ */}
      {visao === "buscar" && (
        <div style={{ maxWidth: 480 }}>
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 14, padding: 24, marginBottom: 16,
          }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 500 }}>
              Busca por ISBN
            </h2>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 18px" }}>
              Complexidade: <code style={{ fontFamily: "monospace", color: "var(--color-text-primary)" }}>O(log n)</code> — a
              estrutura balanceada elimina buscas lineares
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={campoBusca}
                onChange={e => setCampoBusca(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBuscar()}
                placeholder="Ex: 978-85-01"
                style={{
                  flex: 1, padding: "8px 12px", fontSize: 13, borderRadius: 8,
                  border: "0.5px solid var(--color-border-tertiary)",
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                }}
              />
              <button
                onClick={handleBuscar}
                style={{
                  padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                  border: "0.5px solid #534AB7", background: "#EEEDFE", color: "#3C3489", fontSize: 13,
                }}
              >
                <i className="ti ti-search" style={{ fontSize: 14 }} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Resultado — encontrado */}
          {resultadoBusca && resultadoBusca !== "nao_encontrado" && (
            <div style={{ background: "#E1F5EE", border: "0.5px solid #5DCAA5", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: "#0F6E56", marginBottom: 10, fontFamily: "monospace" }}>
                ✓ ENCONTRADO — O(log {Math.ceil(Math.log2(totalLivros + 1))}) comparações no máximo
              </div>
              <div style={{ fontWeight: 500, fontSize: 16, color: "#04342C", marginBottom: 4 }}>
                {resultadoBusca.titulo}
              </div>
              <div style={{ fontSize: 13, color: "#085041" }}>
                {resultadoBusca.autor} · {resultadoBusca.ano}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#9FE1CB", color: "#04342C" }}>
                  {resultadoBusca.genero}
                </span>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 20,
                  background: resultadoBusca.disponivel ? "#9FE1CB" : "#FAC775",
                  color:      resultadoBusca.disponivel ? "#04342C"  : "#412402",
                }}>
                  {resultadoBusca.disponivel ? "disponível" : "emprestado"}
                </span>
              </div>
            </div>
          )}

          {/* Resultado — não encontrado */}
          {resultadoBusca === "nao_encontrado" && (
            <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, color: "#791F1F" }}>
                ISBN <strong style={{ fontFamily: "monospace" }}>"{campoBusca}"</strong> não encontrado na árvore.
              </div>
            </div>
          )}

          {/* Lista de ISBNs para facilitar o teste */}
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 8 }}>
              ISBNs disponíveis para teste:
            </strong>
            {livros.slice(0, 5).map(l => (
              <div key={l.isbn} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <code style={{ fontSize: 11, background: "var(--color-background-secondary)", padding: "1px 6px", borderRadius: 4 }}>
                  {l.isbn}
                </code>
                <span>{l.titulo}</span>
                <button
                  onClick={() => setCampoBusca(l.isbn)}
                  style={{ background: "none", border: "none", color: "#534AB7", cursor: "pointer", fontSize: 11, padding: 0 }}
                >
                  usar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================
          VISÃO: ÁRVORE
          Renderiza o diagrama SVG da estrutura AVL atual
      ================================================================ */}
      {visao === "arvore" && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 12, color: "var(--color-text-secondary)" }}>
            Cada nó exibe o <strong style={{ color: "var(--color-text-primary)" }}>fator de
            balanceamento (fb = altura(esq) − altura(dir))</strong>. A AVL garante |fb| ≤ 1
            em todos os nós após cada operação.
          </div>

          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 14, padding: 16,
          }}>
            {/* Componente SVG de visualização */}
            <VisualizadorArvore arvore={arvoreRef.current} isbnDestaque={isbnDestaque} />
          </div>

          {/* Legenda dos fatores de balanceamento */}
          <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11, color: "var(--color-text-secondary)" }}>
            <span>● <span style={{ color: "#1D9E75" }}>fb = 0</span> — perfeitamente balanceado</span>
            <span>● <span style={{ color: "#BA7517" }}>fb = ±1</span> — aceitável pela AVL</span>
            <span>● <span style={{ color: "#E24B4A" }}>fb = ±2</span> — requer rotação</span>
          </div>
        </div>
      )}

      {/* ================================================================
          VISÃO: LOG
          Histórico cronológico de operações executadas na AVL
      ================================================================ */}
      {visao === "log" && (
        <div>
          <div style={{ marginBottom: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>
            Histórico das operações INSERT, DELETE, SEARCH e UPDATE na Árvore AVL
          </div>

          {log.length === 0 && (
            <div style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              Nenhuma operação registrada ainda.
            </div>
          )}

          {log.map((entrada, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "8px 12px",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                fontSize: 13,
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0, paddingTop: 1 }}>
                {entrada.hora}
              </span>
              {/* Indicador colorido por tipo de operação */}
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: COR_LOG[entrada.tipo],
                marginTop: 5, flexShrink: 0,
              }} />
              <span style={{ color: "var(--color-text-primary)" }}>{entrada.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
