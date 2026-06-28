import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Register.css"

export default function Register() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
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
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Inscription réussie ! Redirection...');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                setError(data.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de connexion au serveur');
        }
    };

    return (
        <div id="containerRegister">
            <form onSubmit={handleSubmit} id="formRegister">

                <span className="input-span">
                    <label htmlFor="firstname">Prénom :</label>
                    <input
                        type="text"
                        name="firstname"
                        id="firstname"
                        placeholder="Votre prénom..."
                        minLength={1}
                        maxLength={30}
                        value={formData.firstname}
                        onChange={handleChange}
                        required
                    />
                </span>

                <span className="input-span">
                    <label htmlFor="lastname">Nom de famille :</label>
                    <input
                        type="text"
                        name="lastname"
                        id="lastname"
                        placeholder="Votre nom de famille..."
                        minLength={1}
                        maxLength={30}
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                    />
                </span>

                <span className="input-span">
                    <label htmlFor="mail">Mail :</label>
                    <input
                        type="email"
                        name="mail"
                        id="mail"
                        placeholder="Votre mail..."
                        minLength={1}
                        maxLength={30}
                        value={formData.mail}
                        onChange={handleChange}
                        required
                    />
                </span>

                <span className="input-span">
                    <label htmlFor="mdp">Mot de passe :</label>
                    <input
                        type="password"
                        name="mdp"
                        id="mdp"
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$"
                        title="Doit contenir au minimum 12 caractères avec 1 majuscule, une minuscule, un caractère spécial et un chiffre"
                        placeholder="Votre mot de passe..."
                        value={formData.mdp}
                        onChange={handleChange}
                        required
                    />
                </span>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <input className="submit" type="submit" defaultValue="Valider" />
            </form>
        </div>
    );
}