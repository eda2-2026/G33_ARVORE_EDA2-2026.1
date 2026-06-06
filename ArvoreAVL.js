// =============================================================
//  ÁRVORE AVL — Implementação completa
//  Trabalho de Estrutura de Dados — Faculdade
//
//  A Árvore AVL (Adelson-Velsky e Landis, 1962) é uma BST
//  auto-balanceada que garante altura O(log n), assegurando
//  complexidade O(log n) para busca, inserção e remoção.
// =============================================================

// ------------------------------------------------------------------
// Nó da Árvore AVL
// Cada nó armazena um livro, ponteiros para filhos e sua própria altura
// ------------------------------------------------------------------
class NoAVL {
  constructor(livro) {
    this.livro   = livro;   // dado armazenado (objeto Livro)
    this.esq     = null;    // filho esquerdo
    this.dir     = null;    // filho direito
    this.altura  = 1;       // altura do nó (folha = 1)
  }
}

// ------------------------------------------------------------------
// Classe principal da Árvore AVL
// Chave de ordenação: ISBN do livro (string lexicográfica)
// ------------------------------------------------------------------
class ArvoreAVL {
  constructor() {
    this.raiz = null; // referência para a raiz da árvore
  }

  // ---- Utilitários de altura e fator de balanceamento ----

  // Retorna a altura de um nó (null retorna 0)
  altura(no) {
    return no ? no.altura : 0;
  }

  // Fator de balanceamento = altura(esq) - altura(dir)
  // AVL exige: -1 ≤ fb ≤ 1 para todo nó
  fatorBalanceamento(no) {
    return no ? this.altura(no.esq) - this.altura(no.dir) : 0;
  }

  // Recalcula a altura do nó com base em seus filhos
  atualizarAltura(no) {
    no.altura = 1 + Math.max(this.altura(no.esq), this.altura(no.dir));
  }

  // ---- Rotações — operações de rebalanceamento ----

  // ROTAÇÃO SIMPLES À DIREITA (caso LL)
  // Usada quando o sub-árvore esquerda está mais pesada
  //
  //      y                x
  //     / \             /   \
  //    x   T3   →     T1     y
  //   / \                   / \
  //  T1  T2               T2  T3
  rotacaoDireita(y) {
    const x  = y.esq;
    const T2 = x.dir;

    // Executa a rotação
    x.dir = y;
    y.esq = T2;

    // Atualiza alturas (y primeiro, pois agora está abaixo de x)
    this.atualizarAltura(y);
    this.atualizarAltura(x);

    return x; // x é a nova raiz deste sub-árvore
  }

  // ROTAÇÃO SIMPLES À ESQUERDA (caso RR)
  // Usada quando o sub-árvore direita está mais pesada
  //
  //    x                   y
  //   / \                /   \
  //  T1   y     →       x     T3
  //      / \           / \
  //     T2  T3        T1  T2
  rotacaoEsquerda(x) {
    const y  = x.dir;
    const T2 = y.esq;

    // Executa a rotação
    y.esq = x;
    x.dir = T2;

    // Atualiza alturas
    this.atualizarAltura(x);
    this.atualizarAltura(y);

    return y; // y é a nova raiz deste sub-árvore
  }

  // BALANCEAMENTO DO NÓ
  // Verifica o fator de balanceamento e aplica a rotação necessária
  balancear(no) {
    this.atualizarAltura(no);
    const fb = this.fatorBalanceamento(no);

    // Caso LL: sub-árvore esquerda está pesada para a esquerda
    if (fb > 1 && this.fatorBalanceamento(no.esq) >= 0)
      return this.rotacaoDireita(no);

    // Caso LR: sub-árvore esquerda está pesada para a direita
    // Requer rotação dupla: esquerda no filho, depois direita no nó
    if (fb > 1 && this.fatorBalanceamento(no.esq) < 0) {
      no.esq = this.rotacaoEsquerda(no.esq);
      return this.rotacaoDireita(no);
    }

    // Caso RR: sub-árvore direita está pesada para a direita
    if (fb < -1 && this.fatorBalanceamento(no.dir) <= 0)
      return this.rotacaoEsquerda(no);

    // Caso RL: sub-árvore direita está pesada para a esquerda
    // Requer rotação dupla: direita no filho, depois esquerda no nó
    if (fb < -1 && this.fatorBalanceamento(no.dir) > 0) {
      no.dir = this.rotacaoDireita(no.dir);
      return this.rotacaoEsquerda(no);
    }

    return no; // nó já está balanceado
  }

  // ---- Operações principais ----

  // INSERÇÃO — O(log n)
  // Insere recursivamente e rebalanceia no caminho de volta (pós-ordem)
  _inserir(no, livro) {
    // Caso base: posição encontrada, cria novo nó
    if (!no) return new NoAVL(livro);

    // Desce pela árvore comparando ISBNs
    if (livro.isbn < no.livro.isbn)
      no.esq = this._inserir(no.esq, livro);       // vai para a esquerda
    else if (livro.isbn > no.livro.isbn)
      no.dir = this._inserir(no.dir, livro);       // vai para a direita
    else
      return no; // ISBN duplicado: ignora inserção

    // Rebalanceia o nó atual ao retornar da recursão
    return this.balancear(no);
  }

  inserir(livro) {
    this.raiz = this._inserir(this.raiz, livro);
  }

  // MENOR NÓ — auxiliar para remoção
  // Encontra o nó com menor chave em um sub-árvore (mais à esquerda)
  menorNo(no) {
    while (no.esq) no = no.esq;
    return no;
  }

  // REMOÇÃO — O(log n)
  // Remove o nó com o ISBN dado e rebalanceia o caminho de volta
  _remover(no, isbn) {
    if (!no) return null;

    // Localiza o nó a remover
    if (isbn < no.livro.isbn)
      no.esq = this._remover(no.esq, isbn);
    else if (isbn > no.livro.isbn)
      no.dir = this._remover(no.dir, isbn);
    else {
      // Nó encontrado — três casos:

      // Caso 1 ou 2: zero ou um filho → substitui pelo filho existente
      if (!no.esq || !no.dir) return no.esq || no.dir;

      // Caso 3: dois filhos → substitui pelo sucessor in-order
      // (menor nó da sub-árvore direita) e remove o sucessor
      const sucessor = this.menorNo(no.dir);
      no.livro = sucessor.livro;
      no.dir   = this._remover(no.dir, sucessor.livro.isbn);
    }

    // Rebalanceia após remoção
    return this.balancear(no);
  }

  remover(isbn) {
    this.raiz = this._remover(this.raiz, isbn);
  }

  // BUSCA POR ISBN — O(log n)
  // Aproveitando a propriedade BST: em cada nó, decide para qual lado descer
  _buscar(no, isbn) {
    if (!no) return null;                          // não encontrado
    if (isbn === no.livro.isbn) return no.livro;   // encontrado!
    if (isbn < no.livro.isbn)
      return this._buscar(no.esq, isbn);           // descende à esquerda
    return this._buscar(no.dir, isbn);             // descende à direita
  }

  buscar(isbn) {
    return this._buscar(this.raiz, isbn);
  }

  // PERCURSO EM ORDEM (in-order traversal) — O(n)
  // Visita esq → raiz → dir, produzindo os elementos em ordem crescente de ISBN
  _emOrdem(no, resultado = []) {
    if (!no) return resultado;
    this._emOrdem(no.esq, resultado);
    resultado.push(no.livro);
    this._emOrdem(no.dir, resultado);
    return resultado;
  }

  listarOrdenado() {
    return this._emOrdem(this.raiz);
  }

  // BUSCA POR TÍTULO — O(n)
  // Não pode usar a propriedade BST (chave é ISBN), então percorre toda a árvore
  _buscarTitulo(no, termo, resultado = []) {
    if (!no) return resultado;
    if (no.livro.titulo.toLowerCase().includes(termo.toLowerCase()))
      resultado.push(no.livro);
    this._buscarTitulo(no.esq, termo, resultado);
    this._buscarTitulo(no.dir, termo, resultado);
    return resultado;
  }

  buscarPorTitulo(termo) {
    return this._buscarTitulo(this.raiz, termo);
  }

  // ---- Métodos auxiliares para visualização ----

  // Gera lista de nós com posição (x,y) para renderização SVG
  _nosParaVisualizacao(no, x, y, dx) {
    if (!no) return [];
    return [
      { x, y, livro: no.livro, fb: this.fatorBalanceamento(no) },
      ...this._nosParaVisualizacao(no.esq, x - dx, y + 70, dx * 0.55),
      ...this._nosParaVisualizacao(no.dir, x + dx, y + 70, dx * 0.55),
    ];
  }

  // Gera lista de arestas (linhas pai→filho) para renderização SVG
  _arestasParaVisualizacao(no, x, y, dx) {
    if (!no) return [];
    const arestas = [];
    if (no.esq) {
      arestas.push({ x1: x, y1: y, x2: x - dx, y2: y + 70 });
      arestas.push(...this._arestasParaVisualizacao(no.esq, x - dx, y + 70, dx * 0.55));
    }
    if (no.dir) {
      arestas.push({ x1: x, y1: y, x2: x + dx, y2: y + 70 });
      arestas.push(...this._arestasParaVisualizacao(no.dir, x + dx, y + 70, dx * 0.55));
    }
    return arestas;
  }

  obterNosVisuais()    { return this._nosParaVisualizacao(this.raiz, 370, 40, 150); }
  obterArestasVisuais() { return this._arestasParaVisualizacao(this.raiz, 370, 40, 150); }
}

export default ArvoreAVL;
