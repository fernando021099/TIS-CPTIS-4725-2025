import React, { useState } from 'react';
import axios from 'axios';

const FormularioOCR = () => {
  const [imagen, setImagen] = useState(null);
  const [textoOCR, setTextoOCR] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagen) return;

    const formData = new FormData();
    formData.append('imagen', imagen);

    try {
      const response = await axios.post('http://localhost:8000/api/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTextoOCR(response.data.texto);
    } catch (error) {
      console.error('Error al procesar OCR:', error);
      setTextoOCR('Error al procesar la imagen.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />
        <button type="submit">Procesar OCR</button>
      </form>

      {textoOCR && (
        <div>
          <h3>Texto Detectado:</h3>
          <p>{textoOCR}</p>
        </div>
      )}
    </div>
  );
};

export default FormularioOCR;
