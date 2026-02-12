'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  fetchFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  type FamilyMember,
} from '@/lib/firestore'
import { uploadFamilyMemberAvatar } from '@/lib/storage'
import { Wallet, Receipt, Users, Plus, Pencil, Trash2, User } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import MobileBottomNav from '@/components/MobileBottomNav'
import Logo from '@/components/Logo'
import SignOutButton from '@/components/SignOutButton'

export default function FamilyClient({ userId }: { userId: string }) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [formName, setFormName] = useState('')
  const [formRelation, setFormRelation] = useState('')
  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null)
  const [formAvatarPreview, setFormAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadMembers = async () => {
    try {
      const data = await fetchFamilyMembers(userId)
      setMembers(data)
    } catch (error) {
      console.error('Error fetching family members:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [userId])

  useEffect(() => {
    if (editingMember) {
      setFormName(editingMember.name)
      setFormRelation(editingMember.relation ?? '')
      setFormAvatarFile(null)
      setFormAvatarPreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
        return editingMember.avatar_url ?? null
      })
    } else {
      setFormName('')
      setFormRelation('')
      setFormAvatarFile(null)
      setFormAvatarPreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [editingMember])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setFormAvatarFile(file)
      setFormAvatarPreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingMember) {
        await updateFamilyMember(userId, editingMember.id, {
          name: formName.trim(),
          relation: formRelation.trim() || null,
        })
        if (formAvatarFile) {
          const avatarUrl = await uploadFamilyMemberAvatar(userId, editingMember.id, formAvatarFile)
          await updateFamilyMember(userId, editingMember.id, { avatar_url: avatarUrl })
        }
      } else {
        const newId = await addFamilyMember(userId, {
          name: formName.trim(),
          relation: formRelation.trim() || null,
        })
        if (formAvatarFile) {
          const avatarUrl = await uploadFamilyMemberAvatar(userId, newId, formAvatarFile)
          await updateFamilyMember(userId, newId, { avatar_url: avatarUrl })
        }
      }
      setShowForm(false)
      setEditingMember(null)
      loadMembers()
    } catch (err) {
      console.error('Error saving family member:', err)
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (member: FamilyMember) => {
    if (!confirm(`Remove "${member.name}" from family members?`)) return
    try {
      await deleteFamilyMember(userId, member.id)
      loadMembers()
    } catch (error) {
      console.error('Error deleting family member:', error)
      alert('Failed to delete')
    }
  }

  const openAdd = () => {
    setEditingMember(null)
    setFormName('')
    setFormRelation('')
    setFormAvatarFile(null)
    setFormAvatarPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    setShowForm(true)
  }

  const openEdit = (member: FamilyMember) => {
    setEditingMember(member)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingMember(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar className="hidden md:flex">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <Logo size="sm" showText={false} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Expense Manager</span>
              <span className="text-xs text-muted-foreground">Track your spending</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard">
                      <Wallet className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/expenses">
                      <Receipt className="h-4 w-4" />
                      <span>Expenses</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/family">
                      <Users className="h-4 w-4" />
                      <span>Family</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-2 space-y-2">
            <SignOutButton />
            <div className="text-xs text-muted-foreground">
              Expense Manager v0.1.0
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 md:flex hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:flex hidden" />
          <Logo size="sm" showText={true} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 pb-20 md:pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Family Members</h2>
            <Button onClick={openAdd} className="hidden sm:flex">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>

          {members.length === 0 ? (
            <div className="bg-card rounded-lg shadow p-8 text-center text-muted-foreground">
              <p className="text-lg">No family members yet</p>
              <p className="text-sm mt-2">Add members to optionally tag expenses (e.g. who the expense was for)</p>
              <Button onClick={openAdd} className="mt-4">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-border">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        {member.relation && (
                          <p className="text-sm text-muted-foreground">{member.relation}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(member)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showForm && (
          <Dialog open={true} onOpenChange={closeForm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile photo (optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {formAvatarPreview ? (
                        <img
                          src={formAvatarPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAvatarChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WebP or GIF. Max recommended 2MB.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relation">Relation (optional)</Label>
                  <Input
                    id="relation"
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value)}
                    placeholder="e.g. Spouse, Child"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : editingMember ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </SidebarInset>
      <MobileBottomNav addHref="/expenses" />
    </SidebarProvider>
  )
}
