import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css"

export default function Login() {
    const [formData, setFormData] = useState({
        mail: '',
        mdp: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Stocker les informations utilisateur
                localStorage.setItem("type", data.type.trim());
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("firstname", data.firstname);
                
                setSuccess('Connexion réussie !');
                
                setTimeout(() => {
                    if (data.type === "admin") {
                        navigate('/admin');
                    }
                }, 500);

            } else {
                setError(data.message || 'Erreur lors de la connexion');
            }

        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de connexion au serveur');
        }
    };
    
return(
        <div id="containerLogin">
            <form onSubmit={handleSubmit} id="formLogin">

                <span className="input-span">
                    <label htmlFor="mail"> Mail : </label>
                    <input type="email" name="mail" id="emailLogin" placeholder="Votre mail..." minLength={1} maxLength={30} value={formData.mail} onChange={handleChange} required />
                </span>
            <br />
            <br />

            <span className="input-span">
                <label htmlFor="mdp">Mot de passe : </label>
                <input type="password" name="mdp" id="mdp" placeholder="Votre mot de passe..." value={formData.mdp} onChange={handleChange} required />
            </span>
                <br />
                <br />

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <input className="submit" type="submit" defaultValue="Valider" />
            </form>
        </div>
    )
}