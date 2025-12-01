import React from 'react';
import { Lock, AlertTriangle, Copy, Check } from 'lucide-react';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    pin: string | null;
    loading: boolean;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    pin,
    loading
}) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        if (pin) {
            navigator.clipboard.writeText(pin);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="relative z-50 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            {!pin ? (
                                <>
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Resetar Senha
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Tem certeza que deseja resetar a senha deste usuário?
                                                Isso irá gerar um PIN temporário de 4 dígitos que o usuário deverá usar para o próximo login.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Lock className="h-6 w-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Senha Resetada com Sucesso
                                        </h3>
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500 mb-2">
                                                Informe este PIN ao usuário para o primeiro acesso:
                                            </p>
                                            <div className="flex items-center justify-center space-x-2 bg-gray-100 p-4 rounded-lg border border-gray-200">
                                                <span className="text-3xl font-mono font-bold tracking-widest text-gray-800">
                                                    {pin}
                                                </span>
                                                <button
                                                    onClick={handleCopy}
                                                    className="ml-2 p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none"
                                                    title="Copiar PIN"
                                                >
                                                    {copied ? (
                                                        <Check className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-5 h-5 text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 text-center">
                                                O usuário será obrigado a trocar a senha após o login.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        {!pin ? (
                            <>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {loading ? 'Resetando...' : 'Confirmar Reset'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brazil-blue text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Fechar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
