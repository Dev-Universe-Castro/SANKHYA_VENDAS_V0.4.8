
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function buscarDadosDoSistema(userId: number) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
    
    const [leadsRes, parceirosRes, produtosRes, pedidosRes] = await Promise.all([
      fetch(`${baseUrl}/api/leads`, { headers: { 'Cookie': `user=${JSON.stringify({ id: userId })}` } }),
      fetch(`${baseUrl}/api/sankhya/parceiros?page=1&pageSize=100`),
      fetch(`${baseUrl}/api/sankhya/produtos?page=1&pageSize=100`),
      fetch(`${baseUrl}/api/sankhya/pedidos/listar?userId=${userId}`)
    ]);

    const leads = leadsRes.ok ? await leadsRes.json() : [];
    const parceirosData = parceirosRes.ok ? await parceirosRes.json() : { parceiros: [] };
    const produtosData = produtosRes.ok ? await produtosRes.json() : { produtos: [] };
    const pedidos = pedidosRes.ok ? await pedidosRes.json() : [];

    return {
      leads: Array.isArray(leads) ? leads : [],
      parceiros: Array.isArray(parceirosData.parceiros) ? parceirosData.parceiros : [],
      produtos: Array.isArray(produtosData.produtos) ? produtosData.produtos : [],
      pedidos: Array.isArray(pedidos) ? pedidos : []
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return { leads: [], parceiros: [], produtos: [], pedidos: [] };
  }
}

const SYSTEM_PROMPT = `Você é um Assistente de Análise de Dados especializado em gerar visualizações inteligentes.

SEU PAPEL:
- Analisar dados de vendas, leads, produtos e clientes
- Gerar widgets de visualização (cards, gráficos, tabelas) baseados nos dados
- Retornar SEMPRE um JSON estruturado no formato especificado

FORMATO DE RESPOSTA OBRIGATÓRIO:
Você DEVE retornar um JSON válido com a seguinte estrutura:

{
  "widgets": [
    {
      "tipo": "card",
      "titulo": "Total de Vendas",
      "dados": {
        "valor": 150000,
        "variacao": "+15%",
        "subtitulo": "vs mês anterior"
      }
    },
    {
      "tipo": "grafico_barras",
      "titulo": "Top 5 Produtos",
      "dados": {
        "labels": ["Produto A", "Produto B", "Produto C"],
        "values": [100, 80, 60]
      }
    },
    {
      "tipo": "tabela",
      "titulo": "Leads em Negociação",
      "dados": {
        "colunas": ["Nome", "Valor", "Estágio"],
        "linhas": [
          ["Lead 1", "R$ 10.000", "Proposta"],
          ["Lead 2", "R$ 15.000", "Negociação"]
        ]
      }
    }
  ]
}

TIPOS DE WIDGETS DISPONÍVEIS:
- card: Para métricas principais (valor, variação, subtítulo)
- grafico_barras: Para comparações (labels, values)
- grafico_linha: Para tendências temporais (labels, values)
- grafico_pizza: Para distribuições (labels, values)
- tabela: Para dados detalhados (colunas, linhas)

REGRAS IMPORTANTES:
1. SEMPRE retorne JSON válido, nunca texto livre
2. Escolha os widgets mais adequados para responder a pergunta
3. Use dados reais fornecidos no contexto
4. Seja visual e informativo
5. Priorize insights acionáveis`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    let userId = 0;
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);
        userId = user.id;
      } catch (e) {
        console.error('Erro ao parsear cookie:', e);
      }
    }

    const dadosSistema = await buscarDadosDoSistema(userId);

    const contextPrompt = `DADOS DO SISTEMA:

LEADS (${dadosSistema.leads.length} total):
${JSON.stringify(dadosSistema.leads.slice(0, 50), null, 2)}

PARCEIROS/CLIENTES (${dadosSistema.parceiros.length} total):
${JSON.stringify(dadosSistema.parceiros.slice(0, 50), null, 2)}

PRODUTOS (${dadosSistema.produtos.length} total):
${JSON.stringify(dadosSistema.produtos.slice(0, 50), null, 2)}

PEDIDOS (${dadosSistema.pedidos.length} total):
${JSON.stringify(dadosSistema.pedidos.slice(0, 50), null, 2)}

PERGUNTA DO USUÁRIO:
${prompt}

IMPORTANTE: Retorne APENAS o JSON estruturado com os widgets. Não adicione texto explicativo antes ou depois do JSON.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: contextPrompt }
    ]);

    const responseText = result.response.text();
    
    // Extrair JSON da resposta (remover markdown se houver)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsedResponse = JSON.parse(jsonText);

    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na análise Gemini:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao processar análise',
      widgets: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
