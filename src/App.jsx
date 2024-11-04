import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { CgLogOut } from 'react-icons/cg';
import moment from 'moment'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

    let mdata = moment().format('LTS L')

    const [ user, setUser ] = useState(null);
    const [ profile, setProfile ] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ponto, setPonto] = useState(false)
    const [form, setForm] = useState({
      nameuser:'',
      resgistro:'',
      pontoAtraso:''
    })
    const [dados, setDados] = useState([])

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
          setUser(codeResponse)
          localStorage.setItem('user', JSON.stringify(codeResponse))
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(() => {
      const storedUser = localStorage.getItem('user'); 
      if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser); // Atualiza o estado com os dados do usuário
      }
      setIsLoading(false); // Conclui o carregamento
  }, []);

    useEffect(
        () => {
            if (user && user.access_token) {
                axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                      console.log(res)
                        setProfile(res.data);
                    })
                    .catch((err) => console.log(err));
            }
        },
        [user]
    );

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
        setUser(null)
        localStorage.removeItem('user')
    };

    const handleSubmit = (e) =>{
      e.preventDefault()
      try{

        fetch('https://sheetdb.io/api/v1/g6pzaqljw9h87?sheet=registro',{
          method:'POST',
          headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body:JSON.stringify({
            data: [{
              'Nome':form.nameuser,
              'Registro':form.resgistro,
              'pontoAtraso':form.pontoAtraso
            }]
          })
        })
        .then((response) => response.json())
        .then((data) => console.log(data))

        notify("Registro cadastrado com sucesso!")

      }catch(e){
        console.log('Erro', e)
      }
      console.log(form)
    }

    const onChange = (evt) =>{
      const value = evt.target.value
      console.log(value)
      const key = evt.target.name 
      setForm(old =>({
        ...old, 
        [key]:value
      }))
    }

    const notify = (msg) =>{
      toast(msg)
    }

    const handleCheckPonto = () =>{
      setPonto((pont) => {
        if (!pont) {
          notify("Registrar um ponto em atraso")
          setForm((old) => ({
            ...old,
            resgistro: '' // Limpa o campo registro quando ponto em atraso é marcado
          }));
        } else {
          notify("Registro de Ponto")
          setForm((old) => ({
            ...old,
            pontoAtraso: '' // Restaura o valor atual do registro
          }));
        }
        return !pont;
      });
      
    }

    const getRegistro = async () =>{
      try{

        const response = await fetch('https://sheetdb.io/api/v1/g6pzaqljw9h87?sheet=registro')
        const data = await response.json()
        console.log(data)
        setDados(data)

      }catch(e){
        console.log('Error: ',e)
      }
    }

    useEffect(() =>{
      getRegistro()
    },[])

    return (
        <div>
            {profile ? (
              <>
                <div className="navbar bg-body-tertiary mb-4">
                  <div className="container">
                    <div className="navbar-brand d-flex gap-4">
                      <img src={profile.picture} alt="" />
                      <div className='main-user' >
                        <p>Usuário Logado</p>
                        <p>Nome: {profile.name}</p>
                        <p>E-mail: {profile.email}</p>
                      </div>
                    </div>
                    <div className='col-12 col-md-3 d-flex justify-content-end'>
                      <button 
                      onClick={logOut}
                      className='btn btn-danger col-12 col-md-4'
                       >
                        <CgLogOut/> &#160; Sair
                       </button>
                    </div>
                  </div>
                </div>

                <div >

                    <form onSubmit={handleSubmit}
                     className='d-flex align-items-center flex-column p-2'
                     >
                     <div className="col-12 col-md-2 mb-4">
                      <input type="text"
                      name="nameuser"
                      className='form-control'
                       onChange={onChange}
                       value={form.nameuser = profile.name}
                       disabled
                        />

                     </div>
                       
                       {
                        !ponto && 
                        <div className='col-12 col-md-2 mb-4' >
                        <input type="text"
                       onChange={onChange}
                       className='form-control'
                       name="resgistro"
                       value={form.resgistro = mdata } 

                        disabled
                       /> 
                        </div>
                       }
                      

                      <button
                       onClick={(e) => {
                        e.preventDefault()
                        handleCheckPonto()
                       }}
                       className='btn btn-warning col-12 col-md-1 mb-4'
                      >{ ponto ? 'Registrar Ponto' :'Ponto em Atraso' }</button>
                      {
                        ponto && 
                        <div className='col-12 col-md-7 mb-4' >
                        <input type="datetime-local" 
                          name="pontoAtraso"
                          className='form-control'
                          value={form.pontoAtraso}
                          onChange={onChange}
                        />
                          
                        </div>
                      }

                      <button className='mt-4 btn btn-success col-12 col-md-1' >
                      Enviar Registro
                      </button>
                    </form>

                    <div>
                      <button onClick={getRegistro} >Verificar Registro</button>

                      <div>
      <h2>Registros</h2>
      <table border="1">
        <thead>
          <tr>
            {/* Substitua 'campo1', 'campo2', etc., pelos nomes das colunas retornadas pelo seu endpoint */}
            <th>Nome</th>
            <th>Registro</th>
            <th>Ponto em Atraso</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item, index) => (
            <tr key={index}>
              {/* Substitua 'item.campo1', 'item.campo2', etc., pelas chaves reais dos dados */}
              <td>{item.Nome}</td>
              <td>{item.Registro}</td>
              <td>{item.pontoAtraso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

                    </div>

                </div>
                <ToastContainer/>
                </>
            ) : (
              <>
                <h2>Clique no botão para efetuar o login</h2>
                <button className='btn btn-google'  onClick={login}>
                <FcGoogle/> &#160; Continuar com Google
                </button>
              </>
            )}
        </div>
    );
}
export default App;