'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function FacilityCatalogPage() {
  const t = useTranslations('admin.catalog');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);

  // Edit states
  const [isEditingService, setIsEditingService] = useState<any | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    serviceName: '',
    category: 'CLINICAL',
    availabilityStatus: 'AVAILABLE',
    operatingDays: '',
    operatingHours: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { onIdTokenChanged } = require('firebase/auth');
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), (user: any) => {
      if (user) loadFacilities(user);
    });
    return () => unsubscribe();
  }, []);

  const loadFacilities = async (u?: any) => {
    try {
      const user = u || getFirebaseAuth().currentUser;
      if (!user) throw new Error(t('permissionDenied'));
      const token = await user.getIdToken();
      const res = await fetch('/api/facility/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t('permissionDenied'));
      const data = await res.json();
      setFacilities(data.facilities || []);
      if (data.facilities?.length === 1) {
        setSelectedFacility(data.facilities[0]);
      } else if (data.facilities?.length > 1) {
        setSelectedFacility(data.facilities[0]);
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async () => {
    if (!selectedFacility) return;
    setSaving(true);
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error();
      const token = await user.getIdToken();
      
      const payload = {
        action: isAddingService ? 'add_service' : 'update_service',
        facilityId: selectedFacility.id,
        ...formData
      };
      
      const res = await fetch('/api/facility/manage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('error'));
      }
      
      alert(t('success'));
      setIsAddingService(false);
      setIsEditingService(null);
      loadFacilities();
    } catch (err: any) {
      alert(err.message || t('error'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeactivateService = async (serviceId: string) => {
    if (!selectedFacility) return;
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error();
      const token = await user.getIdToken();
      
      const payload = {
        action: 'deactivate_service',
        facilityId: selectedFacility.id,
        serviceId
      };
      
      const res = await fetch('/api/facility/manage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(t('error'));
      alert(t('success'));
      loadFacilities();
    } catch (err: any) {
      alert(err.message || t('error'));
    }
  };

  if (loading) return <div className="p-8 text-slate-500">{t('loading')}</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!selectedFacility) return <div className="p-8 text-slate-500">{t('permissionDenied')}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('profileTitle')}</CardTitle>
          <CardDescription>{selectedFacility.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase">{t('name')}</div>
            <div className="font-medium text-slate-900">{selectedFacility.name}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">{t('type')}</div>
            <div className="font-medium text-slate-900">{selectedFacility.type}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">{t('status')}</div>
            <div className="font-medium text-slate-900">{selectedFacility.status}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('catalogTitle')}</CardTitle>
            <CardDescription>{t('lastUpdated')}: {new Date().toLocaleDateString()}</CardDescription>
          </div>
          <Button onClick={() => {
            setFormData({
              serviceId: '',
              serviceName: '',
              category: 'CLINICAL',
              availabilityStatus: 'AVAILABLE',
              operatingDays: '',
              operatingHours: ''
            });
            setIsAddingService(true);
            setIsEditingService(null);
          }}>{t('addService')}</Button>
        </CardHeader>
        <CardContent>
          {(!selectedFacility.services || selectedFacility.services.length === 0) ? (
            <div className="text-center py-8 text-slate-500">{t('emptyCatalog')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">{t('serviceName')}</th>
                    <th className="px-4 py-3">{t('serviceCategory')}</th>
                    <th className="px-4 py-3">{t('availability')}</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFacility.services.map((svc: any) => (
                    <tr key={svc.serviceId} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{svc.serviceName}</td>
                      <td className="px-4 py-3">{svc.category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          svc.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                          svc.availabilityStatus === 'LIMITED' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {svc.availabilityStatus === 'AVAILABLE' ? t('available') :
                           svc.availabilityStatus === 'LIMITED' ? t('limited') : t('unavailable')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setFormData({
                            serviceId: svc.serviceId,
                            serviceName: svc.serviceName,
                            category: svc.category,
                            availabilityStatus: svc.availabilityStatus,
                            operatingDays: svc.operatingDays || '',
                            operatingHours: svc.operatingHours || ''
                          });
                          setIsEditingService(svc);
                          setIsAddingService(false);
                        }}>{t('editService')}</Button>
                        {svc.availabilityStatus !== 'UNAVAILABLE' && (
                           <Button variant="destructive" size="sm" onClick={() => handleDeactivateService(svc.serviceId)}>
                             {t('deactivateService')}
                           </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      {(isAddingService || isEditingService) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>{isAddingService ? t('addTitle') : t('editTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingService && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('serviceName')} ID</label>
                  <input type="text" className="w-full p-2 border rounded" 
                    value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} 
                    placeholder="e.g. opd_pediatrics" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('serviceName')}</label>
                <input type="text" className="w-full p-2 border rounded" 
                  value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('serviceCategory')}</label>
                <select className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="CLINICAL">{t('clinical')}</option>
                  <option value="DIAGNOSTIC">{t('diagnostic')}</option>
                  <option value="MEDICINE">{t('medicine')}</option>
                  <option value="CAPACITY">{t('capacity')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('availability')}</label>
                <select className="w-full p-2 border rounded" value={formData.availabilityStatus} onChange={e => setFormData({...formData, availabilityStatus: e.target.value})}>
                  <option value="AVAILABLE">{t('available')}</option>
                  <option value="LIMITED">{t('limited')}</option>
                  <option value="UNAVAILABLE">{t('unavailable')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('operatingDays')}</label>
                <input type="text" className="w-full p-2 border rounded" 
                  value={formData.operatingDays} onChange={e => setFormData({...formData, operatingDays: e.target.value})} placeholder="e.g. Mon-Fri" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('operatingHours')}</label>
                <input type="text" className="w-full p-2 border rounded" 
                  value={formData.operatingHours} onChange={e => setFormData({...formData, operatingHours: e.target.value})} placeholder="e.g. 09:00-17:00" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => { setIsAddingService(false); setIsEditingService(null); }}>{t('cancel')}</Button>
                <Button onClick={handleSaveService} disabled={saving}>{saving ? '...' : t('save')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
