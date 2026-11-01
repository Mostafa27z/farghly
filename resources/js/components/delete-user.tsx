import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUser() {
    const { isRtl } = useLanguage();
    const passwordInput = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            clearErrors();
            reset();
        }
    };

    return (
        <div className="w-full rounded-2xl sm:rounded-3xl bg-destructive/5 dark:bg-destructive/10 border border-destructive/25 p-4 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border border-destructive/20">
                    <AlertTriangle className="size-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-destructive">
                        {isRtl ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                        {isRtl
                            ? 'بمجرد حذف حسابك، سيتم مسح جميع المحاضرات المفرغة والمذكرات والإعدادات نهائياً ولا يمكن استرجاع هذه البيانات لاحقاً.'
                            : 'Once your account is deleted, all resources and transcripts will be permanently removed. This action cannot be undone.'}
                    </p>
                </div>
            </div>

            <div className="shrink-0">
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="rounded-2xl px-6 py-2.5 text-xs font-bold gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
                        >
                            <Trash2 className="size-4" />
                            <span>{isRtl ? 'حذف الحساب' : 'Delete Account'}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl sm:max-w-md p-6">
                        <DialogTitle className="text-base font-extrabold text-foreground">
                            {isRtl ? 'هل أنت متأكد من رغبتك في حذف الحساب؟' : 'Are you sure you want to delete your account?'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {isRtl
                                ? 'يرجى إدخال كلمة المرور الخاصة بحسابك لتأكيد رغبتك في الحذف النهائي للملف وجميع البيانات.'
                                : 'Please enter your current password to confirm you want to permanently delete your account.'}
                        </DialogDescription>

                        <form onSubmit={deleteUser} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="delete_password" className="text-xs font-bold">
                                    {isRtl ? 'كلمة المرور الحالية' : 'Current Password'}
                                </Label>
                                <Input
                                    id="delete_password"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="rounded-xl text-xs"
                                    required
                                />
                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl text-xs font-semibold"
                                    >
                                        {isRtl ? 'إلغاء' : 'Cancel'}
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    className="rounded-xl text-xs font-bold"
                                >
                                    {processing
                                        ? (isRtl ? 'جارٍ الحذف...' : 'Deleting...')
                                        : (isRtl ? 'تأكيد الحذف النهائي' : 'Confirm Delete')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
