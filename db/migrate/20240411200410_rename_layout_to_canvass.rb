class RenameLayoutToCanvass < ActiveRecord::Migration[7.1]
  def change
    rename_table :layouts, :canvasses
  end
end
