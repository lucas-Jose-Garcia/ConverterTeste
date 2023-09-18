async function gerarId() {
        try {
          const response = await fetch('https://www.uuidgenerator.net/api/version4');
          const uuid = await response.text();
          return uuid;
        } catch (error) {
          console.error('Erro:', error);
        }
}
      

document.addEventListener("DOMContentLoaded", function () {
    const quantidade = document.getElementById("edtQuantidade");  
    const resultado = document.getElementById("caso_textarea");  
    const botaoGerar = document.getElementById("btnGerar");

    botaoGerar.addEventListener("click", async function () {
        const inputQuantidade = quantidade.value;
        let casos = ""
        const id = await gerarId()

        const casoTeste = (caso, id) => {
                return `
                #region Teste: ""
                [Test, Autor(""), DataCriacao("")]
                [Id("${id}")]
                [Nome("")]
                [Detalhamento("")]
                public void Teste${caso.toString().padStart(2, '0')}()
                {
                    Quando($"pressiono o botão Incluir", () => { fORM_DO_CASO.btnIncluir.Click(); });
        
                }
                #endregion
                `
        }

        console.log(inputQuantidade)

        for (i = 0; i < inputQuantidade; i++) {
                const testId = await gerarId()
                console.log(testId)
                casos += "\n" + casoTeste(i+1, testId)
        }


        const outputText = `
        [Id("${id}")]
        [Nome("")]
        [Detalhamento("")]
        public partial class Cenario : CenarioBase
        {
                #region Declarações
                private FormPrincipal formPrincipal = new FormPrincipal();
                //private DECLARA O FORM DO CASO (Ex: formCteRodoviario)
                //private FORM_DO_CASO FORM_DECLARADO = new FORM_DO_CASO();

                //Pré-Requisitos
        	//public static PreRequisitosBD.PRE VARIAVEL;
                #endregion

                public override void Configurar()
                {
                    InicializarPreRequisitos(() =>
                    {
        		//INICIAR DOS PRÉ-REQUISITOS
                        //VARIAVEL = new PreRequisitosBD.NOME_PRE_REQUISITO();

                    });

                    Dado($"que estou na tela principal do sistema", () => { formPrincipal.AguardarForm(); });

                    #region Descrição
                    E($"possuo um PRE_REQUISITO com INFO ['?????']", (string variavel) => { VARIAVEL_PRE_REQUISITO.Codigo = variavel; });
                    E($"cadastro o PRE_REQUISITO", () => { VARIAVEL_PRE_REQUISITO.Adicionar(); });
                    #endregion

                    E($"que estou na tela {FORM_DECLARADO.CaminhoDetalhado}", () => { FORM_DECLARADO.Entrar(); });
                }
            }

        public class Testes : TestesBase
        {
            #region Declarações
            //FORM_DO_CASO FORM_DECLARADO = new FORM_DO_CASO();
            #endregion
            ${casos}

            #region Limpeza de cada teste
            public override Action LimpezaAcao => () =>
            {
                Firebird.ResetarTabela(FirebirdTabela.TABELA_DO_CASO);
            };
            #endregion
        }

        public partial class Cenario
        {
            #region Limpeza final
            public override Action LimpezaAcao => () =>
            {
                Firebird.ResetarTabela(FirebirdTabela.TABELA_DO_PRE_REQUISITO);

                FORM_DECLARADO.Sair();
            };
            #endregion
        }
        `

        resultado.value = outputText;
        navigator.clipboard.writeText(outputText);
    });
});
    