import { useState, useRef } from 'react';
import { read, utils } from 'xlsx';
import Swal from 'sweetalert2';
import { FiUpload, FiEdit, FiSend, FiUser, FiSmartphone } from 'react-icons/fi';

interface Contact {
  nombre: string;
  telefono: string;
}

const BulkMessenger = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Manejar archivo Excel
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json<Contact>(worksheet);

    if (!jsonData[0]?.nombre || !jsonData[0]?.telefono) {
      Swal.fire('Error', 'El archivo debe contener columnas "nombre" y "telefono"', 'error');
      return;
    }

    setContacts(jsonData);
  };

  // Insertar variable en el mensaje
  const insertVariable = (variable: string) => {
    const start = textareaRef.current?.selectionStart || 0;
    const end = textareaRef.current?.selectionEnd || 0;
    const newMessage = message.slice(0, start) + `{{${variable}}}` + message.slice(end);
    setMessage(newMessage);
  };

  // Generar enlaces de WhatsApp
  const generateLinks = () => {
    return contacts.map(contact => {
      const phone = contact.telefono.replace(/[^\d]/g, '');
      const formattedMessage = message
        .replace(/{{nombre}}/g, contact.nombre)
        .replace(/{{telefono}}/g, contact.telefono);
      
      return `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Subir archivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input type="file" accept=".xlsx" onChange={handleFile} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer">
          <FiUpload className="mx-auto text-2xl text-blue-500" />
          <p className="mt-2">Sube tu archivo Excel</p>
          <p className="text-sm text-gray-500">Formatos soportados: .xlsx</p>
        </label>
      </div>

      {/* Vista previa de datos */}
      {contacts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left"><FiUser className="inline" /> Nombre</th>
                <th className="px-6 py-3 text-left"><FiSmartphone className="inline" /> Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map((contact, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{contact.nombre}</td>
                  <td className="px-6 py-4">{contact.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor de mensaje */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => insertVariable('nombre')} className="bg-blue-100 text-blue-600 px-3 py-1 rounded">
            Insertar Nombre
          </button>
          <button onClick={() => insertVariable('telefono')} className="bg-green-100 text-green-600 px-3 py-1 rounded">
            Insertar Teléfono
          </button>
        </div>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Escribe tu mensaje aquí..."
        />
      </div>

      {/* Botón de enviar */}
      {contacts.length > 0 && message && (
        <div className="flex justify-end">
          <a
            href={generateLinks()[0]} // Solo muestra el primer enlace para ejemplo
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <FiSend /> Enviar Mensajes
          </a>
        </div>
      )}
    </div>
  );
};

export default BulkMessenger;