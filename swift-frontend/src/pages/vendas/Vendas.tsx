import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { ProdutosService } from "../../services/produtos/produtos-service.ts";
import { VendasService } from "../../services/vendas/vendas-service.ts";
import { AuthService } from "../../services/auth/auth-service.ts";
import { ClienteService } from "../../services/clientes/clientes-service.ts";
import { Produto } from "../../models/produto.ts";
import { Venda } from "../../models/venda.ts";
import { Cliente } from "../../models/cliente.ts";
import { UsuarioLogado } from "../../services/auth/auth-service.ts";
import AppHeader from "../../components/vendas/AppHeader.tsx";
import ProductSearchModal from "../../components/vendas/ProductSearchModal.tsx";
import ClientSearchModal from "../../components/vendas/ClientSearchModal.tsx";
import CartList from "../../components/vendas/CartList.tsx";
import OrderSummary from "../../components/vendas/OrderSummary.tsx";
import { useBarcodeScanner } from "../../hooks/barcodeScan.tsx";
import showToast from "../../components/toast/Toast.jsx";
import { MoneyUtils } from "../../utils/money-utils.ts";

const _produtosService = new ProdutosService();
const _vendasService = new VendasService();
const _authService = new AuthService();
const _clientService = new ClienteService();

function Vendas() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [cart, setCart] = useState<(Produto & { quantity: number })[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
  const processingRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const toastRef = useRef<Set<string>>(new Set());

  const navigate = useNavigate();

  // Função helper para evitar notificações duplas
  const showToastOnce = useCallback((type: string, title: string, message: string, key?: string) => {
    const toastKey = key || `${type}-${title}-${message}`;
    if (toastRef.current.has(toastKey)) {
      return;
    }
    
    toastRef.current.add(toastKey);
    showToast(type, title, message);
    
    setTimeout(() => {
      toastRef.current.delete(toastKey);
    }, 2000);
  }, []);

  // Busca clientes no servidor
  const fetchClientes = useCallback(async () => {
    try {
      const clientesDoServidor = await _clientService.getAllUsers();
      setClientes(clientesDoServidor);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      showToastOnce('error', 'Erro', 'Não foi possível carregar os clientes.');
    }
  }, [showToastOnce]);

  // Busca produtos no servidor
  const fetchProdutos = useCallback(async () => {
    try {
      const produtosDoServidor = await _produtosService.getAllProducts();
      setProdutos(produtosDoServidor);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      showToastOnce('error', 'Erro', 'Não foi possível carregar os produtos.');
    }
  }, [showToastOnce]);

  // Busca usuário logado
  const fetchUsuarioLogado = useCallback(async () => {
    try {
      const usuario = await _authService.getUsuarioLogado();
      setUsuarioLogado(usuario);
    } catch (error) {
      console.error("Erro ao buscar usuário logado:", error);
      showToastOnce('error', 'Erro', 'Não foi possível identificar o usuário logado.');
    }
  }, [showToastOnce]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    
    initializedRef.current = true;
    fetchProdutos();
    fetchClientes();
    fetchUsuarioLogado();
  }, [fetchProdutos, fetchClientes, fetchUsuarioLogado]);

  // Adiciona produto no carrinho pelo codigo_barras
  const handleAddProduct = useCallback(
    (codigoBarras: string) => {
      if (processingRef.current.has(codigoBarras)) {
        return;
      }
      
      processingRef.current.add(codigoBarras);
      
      const product = produtos.find((p) => p.codigo_barras === codigoBarras);

      if (!product) {
        showToastOnce('warning', 'Produto não encontrado', `Produto com código "${codigoBarras}" não encontrado.`);
        processingRef.current.delete(codigoBarras);
        return;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.codigo_barras === product.codigo_barras
        );
        if (existingItem) {
          return prevCart.map((item) =>
            item.codigo_barras === product.codigo_barras
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevCart, { ...product, quantity: 1 }];
        }
      });
      
      setTimeout(() => {
        processingRef.current.delete(codigoBarras);
      }, 1000);
    },
    [produtos, showToastOnce]
  );

  // Seleciona cliente para a venda
  const handleSelectCliente = useCallback((cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setShowClientModal(false);
    showToastOnce('success', 'Cliente selecionado', `Cliente: ${cliente.nome}`);
  }, [showToastOnce]);

  // Cria novo cliente
  const handleCreateCliente = useCallback(async (nome: string, sobrenome: string, cpf: string, telefone?: string) => {
    try {
      const clienteData = {
        nome,
        sobrenome,
        cpf,
        ...(telefone && { telefone })
      };
      
      const novoCliente = await _clientService.createClient(clienteData);
      
      // Atualiza a lista de clientes
      setClientes((prev) => [...prev, novoCliente]);
      
      // Seleciona o cliente recém-criado
      setClienteSelecionado(novoCliente);
      setShowClientModal(false);
      
      showToastOnce('success', 'Cliente cadastrado', `${nome} ${sobrenome} cadastrado com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      
      if (error.response?.data?.message) {
        showToastOnce('error', 'Erro ao cadastrar', error.response.data.message);
      } else {
        showToastOnce('error', 'Erro ao cadastrar', 'Não foi possível cadastrar o cliente.');
      }
      throw error;
    }
  }, [showToastOnce]);

  // Remove cliente da venda
  const handleRemoveCliente = useCallback(() => {
    setClienteSelecionado(null);
    showToastOnce('info', 'Cliente removido', 'Cliente removido da venda.');
  }, [showToastOnce]);

  // Integra com leitor de código de barras
  useBarcodeScanner(handleAddProduct, { 
    enabled: !showSearchModal && !showClientModal
  });

  // Remove item do carrinho
  const handleRemoveItem = useCallback((codigoBarras: string) => {
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.codigo_barras === codigoBarras);
      if (item) {
        setTimeout(() => {
          showToastOnce('info', 'Item removido', `${item.nome} foi removido do carrinho.`, `remove-${codigoBarras}`);
        }, 0);
      }
      return prevCart.filter((item) => item.codigo_barras !== codigoBarras);
    });
  }, [showToastOnce]);

  // Cancela compra
  const handleVoidTransaction = useCallback(() => {
    setCart([]);
    setClienteSelecionado(null);
    showToastOnce('info', 'Compra cancelada', 'O carrinho foi esvaziado.');
  }, [showToastOnce]);

  // Finaliza a venda
  const handleFinalizeSale = useCallback(async (paymentMethod: string) => {
    if (!usuarioLogado) {
      showToastOnce('error', 'Erro', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    if (cart.length === 0) {
      showToastOnce('warning', 'Carrinho vazio', 'Adicione produtos ao carrinho antes de finalizar.');
      return;
    }

    setIsProcessing(true);

    try {
      const vendaData: Venda = {
        usuarioId: usuarioLogado.id,
        clienteId: clienteSelecionado?.id,
        itens: cart.map((item) => ({
          produtoId: item.id!,
          quantidade: item.quantity,
        })),
      };

      const resultado = await _vendasService.criarVenda(vendaData);
      
      showToastOnce('success', 'Venda finalizada', `Venda #${resultado.venda.id} criada com sucesso!`);
      
      setCart([]);
      setClienteSelecionado(null);
      
    } catch (error: any) {
      console.error("Erro ao finalizar venda:", error);
      
      if (error.response?.data?.message) {
        showToastOnce('error', 'Erro na venda', error.response.data.message);
      } else {
        showToastOnce('error', 'Erro na venda', 'Não foi possível finalizar a venda. Tente novamente.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [usuarioLogado, cart, clienteSelecionado, showToastOnce]);

  // Calcula total usando MoneyUtils
  const orderTotal = useMemo(() => {
    return MoneyUtils.calcularTotal(cart);
  }, [cart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "w") {
        navigate("/inicio");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <Container fluid className="p-3 bg-light vh-100 d-flex flex-column">
      <AppHeader
        onSearchClick={() => setShowSearchModal(true)}
        onClientClick={() => setShowClientModal(true)}
        onBarcodeEnter={handleAddProduct}
        clienteSelecionado={clienteSelecionado}
        onRemoveCliente={handleRemoveCliente}
      />

      <Row className="g-3 flex-grow-1">
        <Col md={8}>
          <CartList items={cart} onRemoveItem={handleRemoveItem} />
        </Col>
        <Col md={4}>
          <OrderSummary
            total={orderTotal}
            onVoidTransaction={handleVoidTransaction}
            onFinalizeSale={handleFinalizeSale}
            isProcessing={isProcessing}
            clienteSelecionado={clienteSelecionado}
          />
        </Col>
      </Row>

      {/* Modal de busca de produtos */}
      <ProductSearchModal
        show={showSearchModal}
        onHide={() => setShowSearchModal(false)}
        products={produtos}
        onProductSelect={handleAddProduct}
      />

      {/* Modal de busca de clientes */}
      <ClientSearchModal
        show={showClientModal}
        onHide={() => setShowClientModal(false)}
        clientes={clientes}
        onClientSelect={handleSelectCliente}
        onCreateClient={handleCreateCliente}
      />
    </Container>
  );
}

export default Vendas;