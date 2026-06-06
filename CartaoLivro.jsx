// =============================================================
//  COMPONENTE: CartaoLivro
//  Exibe as informações de um livro em um card visual.
//
//  Props:
//    livro         — objeto com isbn, titulo, autor, ano, genero, disponivel
//    corGenero     — { bg, text, border } para o badge de gênero
//    aoRemover     — callback chamado ao clicar no botão de remoção
//    aoAlternarDisp — callback para alternar disponível ↔ emprestado
// =============================================================
function CartaoLivro({ livro, corGenero, aoRemover, aoAlternarDisp }) {
  return (
    <div style={{
      background:    "var(--color-background-primary)",
      border:        "0.5px solid var(--color-border-tertiary)",
      borderRadius:  12,
      padding:       "14px 16px",
      marginBottom:  8,
      display:       "flex",
      alignItems:    "center",
      gap:           14,
    }}>
      {/* Ícone colorido por gênero */}
      <div style={{
        width: 42, height: 42, borderRadius: 8,
        background: corGenero.bg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <i className="ti ti-book" style={{ fontSize: 20, color: corGenero.text }} aria-hidden="true" />
      </div>

      {/* Informações textuais do livro */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, color: "var(--color-text-primary)" }}>
          {livro.titulo}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {livro.autor} · {livro.ano}
        </div>
        {/* ISBN exibido em fonte monospace — é a chave AVL */}
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-tertiary)", marginTop: 2 }}>
          {livro.isbn}
        </div>
      </div>

      {/* Ações: badge de gênero, toggle de disponibilidade, botão remover */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Badge de gênero */}
        <span style={{
          fontSize: 11, padding: "2px 8px", borderRadius: 20,
          background: corGenero.bg, color: corGenero.text,
        }}>
          {livro.genero}
        </span>

        {/* Botão de alternância disponível/emprestado */}
        <button
          onClick={() => aoAlternarDisp(livro.isbn)}
          style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 20, cursor: "pointer",
            background: livro.disponivel ? "#E1F5EE" : "#FAEEDA",
            color:      livro.disponivel ? "#085041" : "#633806",
            border:     `0.5px solid ${livro.disponivel ? "#5DCAA5" : "#EF9F27"}`,
          }}
        >
          {livro.disponivel ? "disponível" : "emprestado"}
        </button>

        {/* Botão de remoção — dispara DELETE na árvore AVL */}
        <button
          onClick={() => aoRemover(livro.isbn, livro.titulo)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#E24B4A" }}
        >
          <i className="ti ti-trash" style={{ fontSize: 15 }} aria-label="remover livro" />
        </button>
      </div>
    </div>
  );
}

export default CartaoLivro;
