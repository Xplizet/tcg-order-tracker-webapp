"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"

export function CsvImportExport() {
  const { apiRequest } = useApi()
  const queryClient = useQueryClient()
  const [showImportModal, setShowImportModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const [duplicateHandling, setDuplicateHandling] = useState<"skip" | "update" | "add">("skip")
  const [importResult, setImportResult] = useState<any>(null)
  const [restoreResult, setRestoreResult] = useState<any>(null)

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("clerk_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/export`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `orders_${new Date().toISOString().split("T")[0]}.csv`

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert("Export successful!")
    } catch (error) {
      alert("Export failed: " + (error as Error).message)
    }
  }

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected")

      const formData = new FormData()
      formData.append("file", selectedFile)

      const token = localStorage.getItem("clerk_token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/import?duplicate_handling=${duplicateHandling}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Import failed")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["statistics"] })
      setImportResult(data)
      setSelectedFile(null)
    },
    onError: (error: Error) => {
      alert("Import failed: " + error.message)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setImportResult(null)
    }
  }

  const handleBackup = async () => {
    try {
      const token = localStorage.getItem("clerk_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/backup`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Backup failed")
      }

      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `orders_backup_${new Date().toISOString().split("T")[0]}.json`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert("Backup created successfully!")
    } catch (error) {
      alert("Backup failed: " + (error as Error).message)
    }
  }

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!backupFile) throw new Error("No file selected")

      const formData = new FormData()
      formData.append("file", backupFile)

      const token = localStorage.getItem("clerk_token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/restore`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Restore failed")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["statistics"] })
      setRestoreResult(data)
      setBackupFile(null)
    },
    onError: (error: Error) => {
      alert("Restore failed: " + error.message)
    },
  })

  const handleBackupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBackupFile(e.target.files[0])
      setRestoreResult(null)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Export CSV
      </button>

      <button
        onClick={() => setShowImportModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Import CSV
      </button>

      <div className="border-l border-gray-300 mx-2"></div>

      <button
        onClick={handleBackup}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Backup
      </button>

      <button
        onClick={() => setShowRestoreModal(true)}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
      >
        Restore
      </button>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Import Orders from CSV</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duplicate Handling
                </label>
                <select
                  value={duplicateHandling}
                  onChange={(e) => setDuplicateHandling(e.target.value as "skip" | "update" | "add")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="skip">Skip duplicates</option>
                  <option value="update">Update existing</option>
                  <option value="add">Add all as new</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Duplicates are identified by matching product name, store, and order date.
                </p>
              </div>

              {importResult && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Import Results</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>Imported: {importResult.imported_count}</li>
                    <li>Skipped: {importResult.skipped_count}</li>
                    <li>Failed: {importResult.failed_count}</li>
                  </ul>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600">Errors:</p>
                      <ul className="text-xs text-red-600 mt-1">
                        {importResult.errors.map((error: string, idx: number) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setSelectedFile(null)
                    setImportResult(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => importMutation.mutate()}
                  disabled={!selectedFile || importMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importMutation.isPending ? "Importing..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Restore Orders from Backup
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 font-semibold">Warning:</p>
              <p className="text-sm text-yellow-700">
                This will DELETE all your current orders and replace them with the backup data. This action cannot be undone!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Backup File (JSON)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleBackupFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {backupFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {backupFile.name}
                  </p>
                )}
              </div>

              {restoreResult && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Restore Results</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>Restored: {restoreResult.restored_count}</li>
                    <li>Failed: {restoreResult.failed_count}</li>
                  </ul>
                  {restoreResult.errors && restoreResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600">Errors:</p>
                      <ul className="text-xs text-red-600 mt-1">
                        {restoreResult.errors.map((error: string, idx: number) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    setShowRestoreModal(false)
                    setBackupFile(null)
                    setRestoreResult(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you ABSOLUTELY SURE you want to restore? This will delete all current data!")) {
                      restoreMutation.mutate()
                    }
                  }}
                  disabled={!backupFile || restoreMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {restoreMutation.isPending ? "Restoring..." : "Restore (Dangerous!)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
