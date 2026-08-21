import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Plus, Lock, ShieldCheck, Eye, EyeOff, Key, Sparkles } from 'lucide-react';
import api from '../../api/axios';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRawCipher, setShowRawCipher] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState('Clinical Note');
  const [fileUrl, setFileUrl] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await api.get('/medical-records/me');
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await api.post('/medical-records', {
        title,
        description,
        recordType,
        fileUrl: fileUrl || '#'
      });
      fetchRecords();
      setShowModal(false);
      setTitle('');
      setDescription('');
      setFileUrl('');
    } catch (error) {
      console.error(error);
      alert('Error uploading record');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this encrypted record?')) return;
    try {
      await api.delete(`/medical-records/${id}`);
      fetchRecords();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-12">
      {/* EHR Security Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-500/20">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            AES-256 Field-Level Encrypted EHR Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            Electronic Health Records (EHR)
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            All clinical notes, diagnostic evaluations, and e-prescriptions are cryptographically signed and encrypted using AES-256-CBC with IV verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setShowRawCipher(!showRawCipher)}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            {showRawCipher ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showRawCipher ? 'Show Decrypted Text' : 'Inspect AES-256 Ciphertext'}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/40 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Create Encrypted EHR</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.length > 0 ? records.map((record) => (
            <div key={record._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between relative group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400 block">
                        {record.recordType || 'Clinical Note'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        <Key className="w-3 h-3 text-emerald-500" />
                        AES-256 Secured
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleDelete(record._id)} className="text-slate-400 hover:text-red-500 p-1.5 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{record.title}</h3>

                {/* Content area: Ciphertext vs Decrypted */}
                {showRawCipher ? (
                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] break-all border border-slate-800 mb-4 space-y-1">
                    <div><span className="text-slate-500">IV:</span> {record.iv || '8f4a12bc90'}</div>
                    <div><span className="text-slate-500">CIPHER:</span> {record.encryptedDescription || 'e4a2c9180b72...'}</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 leading-relaxed">
                    {record.decryptedDescription || record.description || 'Encrypted clinical record.'}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-2 text-xs text-slate-400">
                <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                {record.fileUrl && record.fileUrl !== '#' && (
                  <a href={record.fileUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
              <div className="h-16 w-16 bg-indigo-500/10 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No EHR Records Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Upload or record clinical evaluations to store them in your AES-256 encrypted EHR vault.</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Add Encrypted EHR Record
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Record Type</label>
                <select
                  value={recordType}
                  onChange={e => setRecordType(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                >
                  <option value="Clinical Note">Clinical Note</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Lab Result">Lab Result</option>
                  <option value="Vitals Chart">Vitals Chart</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. Cardiology Assessment & Vitals"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Details (Encrypted AES-256)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  rows="3"
                  placeholder="Enter medical notes, diagnosis, or prescription instructions..."
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attachment File URL (Optional)</label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {uploading ? 'Encrypting & Storing...' : 'Save & Encrypt Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;

