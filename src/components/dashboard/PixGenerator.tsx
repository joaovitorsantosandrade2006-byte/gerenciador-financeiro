'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Copy, Check } from 'lucide-react';
import { generatePixPayload, generatePixQRCode, PixData } from '@/lib/pix';
import { toast } from 'sonner';

export default function PixGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixPayload, setPixPayload] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    pixKey: '',
    merchantName: '',
    merchantCity: '',
    amount: '',
    description: '',
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pixKey || !formData.merchantName || !formData.merchantCity) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const pixData: PixData = {
      pixKey: formData.pixKey,
      merchantName: formData.merchantName,
      merchantCity: formData.merchantCity,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      description: formData.description || undefined,
    };

    const payload = generatePixPayload(pixData);
    const qrUrl = generatePixQRCode(payload);

    setPixPayload(payload);
    setQrCodeUrl(qrUrl);
    toast.success('QR Code PIX gerado com sucesso!');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  };

  const handleReset = () => {
    setQrCodeUrl('');
    setPixPayload('');
    setFormData({
      pixKey: '',
      merchantName: '',
      merchantCity: '',
      amount: '',
      description: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        handleReset();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
          <QrCode className="w-6 h-6" />
          <span>Gerar PIX</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerador de QR Code PIX</DialogTitle>
          <DialogDescription>Crie um QR Code para receber pagamentos via PIX</DialogDescription>
        </DialogHeader>

        {!qrCodeUrl ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX *</Label>
              <Input
                id="pixKey"
                placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchantName">Nome do Recebedor *</Label>
                <Input
                  id="merchantName"
                  placeholder="João Silva"
                  value={formData.merchantName}
                  onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchantCity">Cidade *</Label>
                <Input
                  id="merchantCity"
                  placeholder="São Paulo"
                  value={formData.merchantCity}
                  onChange={(e) => setFormData({ ...formData, merchantCity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) - Opcional</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <p className="text-xs text-gray-500">Deixe em branco para valor livre</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição - Opcional</Label>
              <Input
                id="description"
                placeholder="Pagamento de serviço"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              Gerar QR Code
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code PIX" 
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Escaneie o QR Code com o app do seu banco
              </p>
            </div>

            {/* PIX Code */}
            <div className="space-y-2">
              <Label>Código PIX (Copia e Cola)</Label>
              <div className="flex gap-2">
                <Input
                  value={pixPayload}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Copie e cole este código no app do seu banco
              </p>
            </div>

            {/* Transaction Details */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-semibold text-gray-900">Detalhes da Transação</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recebedor:</span>
                  <span className="font-medium">{formData.merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cidade:</span>
                  <span className="font-medium">{formData.merchantCity}</span>
                </div>
                {formData.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium text-green-600">
                      R$ {parseFloat(formData.amount).toFixed(2)}
                    </span>
                  </div>
                )}
                {formData.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descrição:</span>
                    <span className="font-medium">{formData.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Gerar Novo
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
