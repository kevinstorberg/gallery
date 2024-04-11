class CreateLayouts < ActiveRecord::Migration[7.1]
  def change
    create_table :layouts do |t|

      t.timestamps
    end
  end
end
